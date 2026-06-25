import { useState } from 'react';
import { X, Zap, Star, Crown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  reason?: 'limit_reached' | 'feature_locked' | 'subscription_expired';
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '€19',
    period: '/mês',
    icon: Zap,
    color: 'text-blue-400',
    border: 'border-blue-500/30 hover:border-blue-500/60',
    btnClass: 'bg-blue-600 hover:bg-blue-500',
    badge: null,
    features: [
      '10 análises por mês',
      '15 subtópicos por análise',
      'Correções detalhadas',
      'Estratégias de crescimento',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€39',
    period: '/mês',
    icon: Star,
    color: 'text-app-accent',
    border: 'border-app-accent/50 hover:border-app-accent',
    btnClass: 'bg-app-accent hover:bg-app-accent-hover',
    badge: 'Popular',
    features: [
      'Análises ilimitadas',
      '34 subtópicos completos',
      'Roteiro de edição',
      'Suporte prioritário',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '€79',
    period: '/mês',
    icon: Crown,
    color: 'text-amber-400',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    btnClass: 'bg-amber-600 hover:bg-amber-500',
    badge: null,
    features: [
      'Tudo do Pro',
      'Plano de acção 7 dias',
      'Análise por coach de elite',
      'Acesso antecipado a features',
    ],
  },
];

export function UpgradeModal({ open, onClose, reason = 'limit_reached' }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!open) return null;

  const heading =
    reason === 'subscription_expired' ? 'Subscrição expirada' :
    reason === 'limit_reached'        ? 'Limite diário atingido' :
                                        'Funcionalidade exclusiva';

  const sub =
    reason === 'subscription_expired'
      ? 'A tua subscrição expirou ou foi cancelada. Renova para continuar a analisar sem limites.'
      : reason === 'limit_reached'
      ? 'O plano gratuito permite 1 análise a cada 24 horas. Faz upgrade para analisar sem limites.'
      : 'Esta funcionalidade está disponível nos planos pagos.';

  async function handleCheckout(planId: string) {
    setLoadingPlan(planId);
    setCheckoutError(null);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: planId },
      });

      if (error) {
        const msg = error.message ?? '';
        if (msg.includes('Failed to send') || msg.includes('not found') || msg.includes('relay')) {
          setCheckoutError(
            'Edge Function não deployada. Corre: npx supabase functions deploy create-checkout',
          );
        } else if (data?.error === 'price_not_configured') {
          setCheckoutError(
            `Price ID do plano "${planId}" não configurado. Define STRIPE_PRICE_${planId.toUpperCase()} nos Secrets da Edge Function.`,
          );
        } else {
          setCheckoutError(error.message ?? 'Erro ao iniciar o pagamento.');
        }
        return;
      }

      if (!data?.url) {
        setCheckoutError('Não foi possível obter o URL do Stripe. Verifica os Secrets da Edge Function.');
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* panel */}
      <div
        className="relative z-10 w-full max-w-2xl rounded-[var(--app-radius-xl)] border border-white/10 bg-[#0F0F18] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div>
            <h2 className="font-grotesk font-bold text-white text-xl">{heading}</h2>
            <p className="font-inter text-white/60 text-sm mt-1 max-w-md leading-relaxed">{sub}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* plan cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 px-6 pb-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loadingPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-[var(--app-radius-lg)] border bg-white/[0.03] p-4 flex flex-col transition-colors',
                  plan.border,
                )}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[0.6rem] font-bold tracking-widest text-white bg-app-accent px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <Icon size={15} className={plan.color} />
                  <span className={cn('font-grotesk font-bold text-sm', plan.color)}>{plan.name}</span>
                </div>

                <div className="flex items-baseline gap-0.5 mb-3">
                  <span className="font-grotesk font-bold text-white text-2xl">{plan.price}</span>
                  <span className="font-inter text-white/40 text-xs">{plan.period}</span>
                </div>

                <ul className="space-y-1.5 flex-1 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 font-inter text-xs text-white/60">
                      <span className={cn('mt-0.5 shrink-0 font-bold', plan.color)}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isLoading || loadingPlan !== null}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-grotesk font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                    plan.btnClass,
                  )}
                >
                  {isLoading ? (
                    <><Loader2 size={14} className="animate-spin" /> A redirecionar…</>
                  ) : (
                    'Assinar agora'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* error message */}
        {checkoutError && (
          <div className="mx-6 mb-4 rounded-lg border border-app-error/30 bg-app-error/10 p-3">
            <p className="font-inter text-xs text-app-error leading-relaxed">{checkoutError}</p>
          </div>
        )}

        {/* footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="font-inter text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Continuar no plano grátis
          </button>
          <p className="font-inter text-[0.65rem] text-white/30">
            Podes cancelar a qualquer momento · Cobrado em EUR
          </p>
        </div>
      </div>
    </div>
  );
}

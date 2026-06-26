import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import { staggerParent, staggerChild } from '@/components/ui/motion-presets';
import { PopCard } from '@/components/ui/PopCard';
import { useAnalyzer } from '@/components/analyze/AnalyzerContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useI18n, type PlanT } from '@/lib/i18n';

const FAKE_ORIGINAL: Partial<Record<string, { price: string; badge: string }>> = {
  starter: { price: '14.99€', badge: '34% OFF' },
};

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="mt-0.5 shrink-0">
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlanCard({ plan, mostChosen }: { plan: PlanT; mostChosen: string }) {
  const { open } = useAnalyzer();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const isPaid = plan.id !== 'free';
  const isFree = plan.id === 'free';
  const pro    = plan.highlight === 'pro';
  const elite  = plan.highlight === 'elite';
  const starter = plan.id === 'starter';

  async function handleClick() {
    setCheckoutError(null);

    if (!isPaid) {
      open(plan.id);
      return;
    }

    if (!session) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: plan.id },
      });

      if (error) {
        const msg = error.message ?? '';
        if (msg.includes('Failed to send') || msg.includes('not found') || msg.includes('relay')) {
          setCheckoutError('Edge Function não deployada. Corre: npx supabase functions deploy create-checkout');
        } else if (data?.error === 'price_not_configured') {
          setCheckoutError(`Price ID do plano "${plan.id}" não configurado nos Secrets.`);
        } else {
          setCheckoutError(msg || 'Erro ao iniciar o pagamento.');
        }
        return;
      }

      if (!data?.url) {
        setCheckoutError('Não foi possível obter o URL do Stripe.');
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Card styles ── */
  const cardStyle: React.CSSProperties = pro
    ? {
        border: '1.5px solid rgba(212,175,55,0.7)',
        background: '#141209',
        boxShadow: '0 0 60px rgba(212,175,55,0.3), 0 8px 40px rgba(0,0,0,0.6)',
        transform: 'scale(1.03)',
      }
    : elite
      ? {
          border: '1px solid rgba(212,175,55,0.45)',
          background: '#111108',
          boxShadow: '0 0 30px rgba(212,175,55,0.12)',
        }
      : isFree
        ? { border: '1px solid #27272a', background: '#0f0f0f' }
        : starter
          ? { border: '1px solid #3f3f46', background: '#111111' }
          : {};

  /* ── Button styles ── */
  const btnPremiumStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #D4AF37, #a07c20)',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '14px',
    fontWeight: '900',
    cursor: 'pointer',
    letterSpacing: '1px',
    width: '100%',
    marginTop: '28px',
    boxShadow: '0 0 20px rgba(212,175,55,0.25)',
    transition: 'all 0.3s ease',
  };

  const btnGhostStyle: React.CSSProperties = {
    background: 'transparent',
    color: '#D4AF37',
    border: '1px solid rgba(212,175,55,0.5)',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    width: '100%',
    marginTop: '28px',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={{ borderRadius: '16px', height: '100%', ...cardStyle }}>
    <PopCard
      intensity={pro ? 'strong' : 'soft'}
      className="flex h-full flex-col rounded-xzk-lg p-7 transition-all duration-500 ease-out"
    >
      {pro && (
        <span
          className="absolute -top-3 left-7 rounded-full px-4 py-1.5 text-[0.7rem] font-black tracking-widest"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #b8960c)', color: '#000000', boxShadow: '0 2px 12px rgba(212,175,55,0.5)' }}
        >
          {mostChosen}
        </span>
      )}

      <div className="flex items-baseline justify-between">
        <h3 className={`text-3xl ${elite || pro ? 'gold-foil' : 'text-text'}`}>{plan.name}</h3>
      </div>
      <p className="mt-2 min-h-[2.5rem] text-sm text-muted">{plan.tagline}</p>

      {FAKE_ORIGINAL[plan.id] && (
        <div className="mt-4 flex items-center gap-2">
          <span className="font-mono text-sm text-muted line-through opacity-80">{FAKE_ORIGINAL[plan.id]!.price}</span>
          <span
            className="rounded px-2 py-0.5 text-[0.7rem] font-black text-white"
            style={{ background: '#ff3333', boxShadow: '0 0 8px rgba(255,51,51,0.4)' }}
          >
            {FAKE_ORIGINAL[plan.id]!.badge}
          </span>
        </div>
      )}

      <div className={`flex items-end gap-1 ${FAKE_ORIGINAL[plan.id] ? 'mt-1' : 'mt-5'}`}>
        <span className="num-glow gold-foil font-mono text-4xl font-bold">{plan.price}</span>
        <span className="pb-1 font-mono text-xs text-muted">{plan.cadence}</span>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2 text-text/90">
            <Check />
            {f}
          </li>
        ))}
      </ul>

      {checkoutError && (
        <p className="mt-3 rounded border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger leading-snug">
          {checkoutError}
        </p>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={isFree ? btnGhostStyle : btnPremiumStyle}
        onMouseEnter={e => {
          if (!isFree) {
            e.currentTarget.style.boxShadow = '0 0 35px rgba(212,175,55,0.45)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }
        }}
        onMouseLeave={e => {
          if (!isFree) {
            e.currentTarget.style.boxShadow = '0 0 20px rgba(212,175,55,0.25)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Loader2 size={14} className="animate-spin" /> A redirecionar…
          </span>
        ) : (
          plan.cta
        )}
      </button>
    </PopCard>
    </div>
  );
}

export function Plans() {
  const { t } = useI18n();
  return (
    <section id="planos" className="relative mx-auto max-w-[var(--maxw)] px-5 py-24 sm:px-8 sm:py-32">
      <Reveal className="text-center">
        <span className="chip rounded-full px-3 py-1">{t.plans.chip}</span>
        <h2 className="mx-auto mt-4 max-w-2xl text-[clamp(2rem,5vw,3.4rem)]">
          {t.plans.title} <span className="gold-foil">{t.plans.titleHighlight}</span>.
        </h2>
      </Reveal>

      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-8%' }}
        className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {t.plans.items.map((p) => (
          <motion.div key={p.name} variants={staggerChild} className="relative">
            <PlanCard plan={p} mostChosen={t.plans.mostChosen} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

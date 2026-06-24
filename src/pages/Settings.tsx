import { useNavigate } from 'react-router-dom';
import { User, CreditCard, LogOut, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalyses } from '@/hooks/useAnalyses';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { supabase } from '@/lib/supabase';
import { useAppToast } from '@/hooks/useAppToast';

const PLAN_INFO: Record<string, { label: string; limit: number | null; color: string }> = {
  free:    { label: 'FREE',    limit: 1,    color: 'text-app-text-muted' },
  starter: { label: 'STARTER', limit: 5,    color: 'text-app-info' },
  pro:     { label: 'PRO',     limit: null, color: 'text-app-accent' },
  elite:   { label: 'ELITE',   limit: null, color: 'text-gold' },
};

export default function Settings() {
  const { session, plan } = useAuth();
  const { analyses } = useAnalyses(session?.user?.id);
  const navigate = useNavigate();
  const { toast } = useAppToast();

  const email = session?.user?.email ?? '—';
  const createdAt = session?.user?.created_at
    ? new Date(session.user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const planInfo = PLAN_INFO[plan] ?? PLAN_INFO.free;
  // All rows in the DB represent completed analyses
  const usedLifetime = analyses.length;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const usedToday = analyses.filter((a) => new Date(a.created_at) >= today).length;

  const usageCount = plan === 'starter' ? usedToday : usedLifetime;
  const usageLimit = planInfo.limit;
  const usagePct = usageLimit ? Math.min((usageCount / usageLimit) * 100, 100) : 0;

  async function handleLogout() {
    await supabase.auth.signOut();
    toast('Sessão terminada.', 'info');
    navigate('/auth');
  }

  const labelClass ='text-xs font-inter font-medium text-app-text-muted uppercase tracking-wide mb-3 block';
  const rowClass = 'flex items-center justify-between py-3 border-b border-app-border-subtle last:border-0';
  const keyClass = 'font-inter text-sm text-app-text-secondary';
  const valClass = 'font-inter text-sm text-app-text-primary font-medium';

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="font-grotesk font-bold text-app-text-primary text-2xl">Definições</h1>
        <p className="font-inter text-app-text-muted text-sm mt-0.5">Conta e plano</p>
      </div>

      {/* Account info */}
      <div>
        <span className={labelClass}>
          <User size={12} className="inline mr-1.5 -mt-0.5" />
          Conta
        </span>
        <Card className="px-5 divide-y divide-app-border-subtle">
          <div className={rowClass}>
            <span className={keyClass}>Email</span>
            <span className={valClass}>{email}</span>
          </div>
          <div className={rowClass}>
            <span className={keyClass}>Membro desde</span>
            <span className={valClass}>{createdAt}</span>
          </div>
          <div className={rowClass}>
            <span className={keyClass}>Total de análises</span>
            <span className={valClass}>{analyses.length}</span>
          </div>
        </Card>
      </div>

      {/* Plan */}
      <div>
        <span className={labelClass}>
          <CreditCard size={12} className="inline mr-1.5 -mt-0.5" />
          Plano
        </span>
        <Card className="px-5 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[var(--app-radius-sm)] bg-app-accent-subtle flex items-center justify-center">
                <Zap size={15} className="text-app-accent" />
              </div>
              <div>
                <p className={`font-mono font-bold text-sm ${planInfo.color}`}>{planInfo.label}</p>
                <p className="font-inter text-xs text-app-text-muted">
                  {planInfo.limit === null
                    ? 'Análises ilimitadas'
                    : plan === 'starter'
                    ? `${planInfo.limit} análises/dia`
                    : `${planInfo.limit} análise vitalícia`}
                </p>
              </div>
            </div>
          </div>

          {usageLimit !== null && (
            <ProgressBar
              value={usagePct}
              label={
                plan === 'starter'
                  ? `Análises hoje: ${usageCount} / ${usageLimit}`
                  : `Análises usadas: ${usageCount} / ${usageLimit}`
              }
              variant={usagePct >= 100 ? 'warning' : 'accent'}
            />
          )}

          {(plan === 'free' || plan === 'starter') && (
            <div className="pt-2 border-t border-app-border-subtle">
              <p className="font-inter text-xs text-app-text-muted mb-3">
                Faz upgrade para analisar mais clips e desbloquear funcionalidades avançadas.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/#planos')}>
                Ver planos →
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Danger zone */}
      <div>
        <span className={labelClass}>Sessão</span>
        <Card className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-inter text-sm font-medium text-app-text-primary">Terminar sessão</p>
              <p className="font-inter text-xs text-app-text-muted mt-0.5">Sair de todos os dispositivos nesta sessão.</p>
            </div>
            <Button variant="danger" size="sm" onClick={handleLogout}>
              <LogOut size={14} />
              Sair
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

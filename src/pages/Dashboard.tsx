import { useNavigate } from 'react-router-dom';
import { Upload, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalyses } from '@/hooks/useAnalyses';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { AnalysisCardSkeleton } from '@/components/ui/Skeleton';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import type { Analysis } from '@/types';

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-[var(--app-radius-md)] bg-app-accent-subtle flex items-center justify-center text-app-accent shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-grotesk font-bold text-app-text-primary text-xl leading-none">{value}</p>
        <p className="font-inter text-app-text-muted text-xs mt-1">{label}</p>
      </div>
    </Card>
  );
}

function RecentCard({ analysis, onClick }: { analysis: Analysis; onClick: () => void }) {
  const fd = analysis.form_data;
  const platform = fd?.platform;
  const aiResult = fd?.ai_result;
  const title = platform
    ? `${platform}${analysis.tema ? ' · ' + analysis.tema : ''}`
    : analysis.tema || 'Clip sem título';

  return (
    <Card
      className="p-4 flex items-center gap-4 cursor-pointer hover:bg-app-bg-hover transition-colors"
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-[var(--app-radius-md)] bg-app-accent-subtle flex items-center justify-center text-app-accent shrink-0">
        <TrendingUp size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-inter font-medium text-app-text-primary text-sm truncate">{title}</p>
        <p className="font-inter text-app-text-muted text-xs mt-0.5">{formatRelativeTime(analysis.created_at)}</p>
      </div>
      <div className="shrink-0 flex items-center gap-3">
        {aiResult && (
          <span className="font-mono font-bold text-gold text-sm">
            {aiResult.viral_readiness}<span className="text-app-text-muted text-xs">/100</span>
          </span>
        )}
        <Badge status="done" />
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { session } = useAuth();
  const { analyses, loading } = useAnalyses(session?.user?.id);
  const navigate = useNavigate();

  const total = analyses.length;
  const done = analyses.filter((a) => a.form_data?.ai_result != null).length;
  const avgScore = done > 0
    ? Math.round(
        analyses
          .filter((a) => a.form_data?.ai_result != null)
          .reduce((sum, a) => sum + (a.form_data?.ai_result?.viral_readiness ?? 0), 0) / done,
      )
    : 0;

  const recent = analyses.slice(0, 8);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-app-text-primary text-2xl">Dashboard</h1>
          <p className="font-inter text-app-text-muted text-sm mt-0.5">{formatDate(new Date().toISOString())}</p>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/app/upload')}>
          <Upload size={16} />
          Nova análise
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={TrendingUp}  label="Total de análises"    value={total} />
        <StatCard icon={CheckCircle} label="Concluídas"           value={done} />
        <StatCard icon={TrendingUp}  label="Score médio"          value={done > 0 ? `${avgScore}/100` : '—'} />
      </div>

      {/* Recent */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-grotesk font-semibold text-app-text-primary text-base">Análises recentes</h2>
          {total > 8 && (
            <button
              onClick={() => navigate('/app/library')}
              className="font-inter text-xs text-app-accent hover:text-app-accent-hover transition-colors"
            >
              Ver todas →
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <AnalysisCardSkeleton key={i} />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<Upload size={20} />}
            title="Sem análises ainda"
            description="Faz o upload do teu primeiro clip para receber o teu raio-X de viralização."
            action={
              <Button variant="primary" onClick={() => navigate('/app/upload')}>
                <Upload size={16} />
                Fazer primeiro upload
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {recent.map((a) => (
              <RecentCard
                key={a.id}
                analysis={a}
                onClick={() => navigate(`/app/analysis/${a.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

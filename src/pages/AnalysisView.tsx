import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ResultView } from '@/components/analyze/ResultView';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import type { Analysis } from '@/types';

export default function AnalysisView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) setError('Análise não encontrada.');
        else setAnalysis(data as Analysis);
        setLoading(false);
      });
  }, [id]);

  const fd = analysis?.form_data;
  const aiResult = fd?.ai_result;
  const platform = fd?.platform;
  const title = platform
    ? `${platform}${analysis?.tema ? ' · ' + analysis.tema : ''}`
    : analysis?.tema || 'Análise';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-64 w-full mt-6" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="font-grotesk font-semibold text-app-text-primary text-lg mb-2">Análise não encontrada</p>
        <p className="font-inter text-app-text-muted text-sm mb-6">{error ?? 'Verifica se o endereço está correcto.'}</p>
        <Button variant="secondary" onClick={() => navigate('/app/library')}>
          <ArrowLeft size={16} />
          Voltar à Library
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mt-1 w-8 h-8 flex items-center justify-center rounded-[var(--app-radius-md)] text-app-text-muted hover:text-app-text-primary hover:bg-app-bg-hover transition-colors shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-grotesk font-bold text-app-text-primary text-xl truncate">{title}</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="font-inter text-xs text-app-text-muted">{formatDate(analysis.created_at)}</span>
            {analysis.tema && (
              <span className="font-inter text-xs bg-app-accent-subtle text-app-accent px-2 py-0.5 rounded-full">
                {analysis.tema}
              </span>
            )}
            {analysis.duracao ? (
              <span className="font-mono text-xs text-app-text-muted">{analysis.duracao}s</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Content */}
      {aiResult ? (
        <div className="bg-app-bg-card border border-app-border-subtle rounded-[var(--app-radius-xl)] p-6">
          <ResultView result={aiResult} />
        </div>
      ) : (
        <div className="bg-app-error/5 border border-app-error/20 rounded-[var(--app-radius-xl)] p-8 text-center">
          <p className="font-grotesk font-semibold text-app-error text-base mb-2">Resultado não disponível</p>
          <p className="font-inter text-app-text-muted text-sm mb-6">
            O resultado desta análise não foi guardado. Tenta fazer uma nova análise.
          </p>
          <Button variant="primary" onClick={() => navigate('/app/upload')}>
            Nova análise
          </Button>
        </div>
      )}
    </div>
  );
}

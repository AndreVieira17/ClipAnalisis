import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ResultView } from '@/components/analyze/ResultView';
import type { Analysis } from '@/types';

export default function AnaliseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setAnalysis(data as Analysis);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (notFound || !analysis) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center gap-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">Análise não encontrada</p>
        <h1 className="text-4xl sm:text-5xl">404</h1>
        <p className="text-sm text-muted">Esta análise não existe ou não tens permissão para a ver.</p>
        <button
          onClick={() => navigate('/historico')}
          className="btn-gold rounded-xzk px-6 py-3 text-sm"
        >
          OS MEUS CLIPS
        </button>
      </div>
    );
  }

  const result = analysis.form_data?.ai_result;
  const platform = analysis.form_data?.platform;
  const title = platform
    ? `${platform}${analysis.tema ? ' · ' + analysis.tema : ''}`
    : analysis.tema || 'Clip sem título';
  const date = new Date(analysis.created_at).toLocaleDateString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-bg px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        {/* top nav */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/historico')}
            className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted hover:text-gold-hi transition-colors"
          >
            ← OS MEUS CLIPS
          </button>
          <span className="chip rounded-full px-3 py-1">RAIO-X ClipAnalisis</span>
        </div>

        {/* title */}
        <div className="mb-8">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted mb-1">{date}</p>
          <h1 className="text-4xl sm:text-5xl break-words">{title.toUpperCase()}</h1>
        </div>

        {result ? (
          <ResultView result={result} />
        ) : (
          <div className="rounded-xzk border border-border bg-surface/30 p-10 text-center">
            <p className="text-2xl mb-3">SEM RESULTADO</p>
            <p className="text-sm text-muted">Esta análise não tem resultado armazenado.</p>
          </div>
        )}

        <button
          onClick={() => navigate('/#planos')}
          className="btn-gold mt-10 w-full rounded-xzk px-6 py-3 text-sm"
        >
          ANALISAR OUTRO CLIP
        </button>
      </div>
    </div>
  );
}

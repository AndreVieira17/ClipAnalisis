import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAnalyses } from '@/hooks/useAnalyses';
import type { Analysis } from '@/types';

function scoreColor(s: number): string {
  if (s >= 70) return '#22c55e'; // green
  if (s >= 50) return '#D4AF37'; // gold/yellow
  return '#E5484D';              // red
}

function scoreBg(s: number): string {
  if (s >= 70) return 'border-green-500/30 bg-green-500/5';
  if (s >= 50) return 'border-gold/30 bg-gold/5';
  return 'border-red-500/30 bg-red-500/5';
}

function AnalysisCard({ analysis }: { analysis: Analysis }) {
  const fd = analysis.form_data;
  const score = fd?.ai_result?.viral_readiness ?? null;
  const platform = fd?.platform ?? '';
  const tema = analysis.tema ?? fd?.ai_result?.niche ?? '';
  const date = new Date(analysis.created_at).toLocaleDateString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div className={`flex flex-col rounded-xzk border bg-surface/30 p-5 hover:bg-surface/50 transition-colors ${score !== null ? scoreBg(score) : 'border-border'}`}>
      {/* platform + date */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          {platform && (
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gold mb-0.5">{platform}</p>
          )}
          <p className="font-mono text-[0.6rem] text-muted">{date}</p>
        </div>
        {score !== null && (
          <div className="shrink-0 text-right">
            <span
              className="font-mono text-3xl font-bold tabular-nums leading-none"
              style={{ color: scoreColor(score) }}
            >
              {score}
            </span>
            <span className="font-mono text-[0.55rem] text-muted block">/100</span>
          </div>
        )}
      </div>

      {/* tema / niche */}
      <p className="font-mono text-sm uppercase tracking-wide text-text flex-1 mb-4 line-clamp-2">
        {tema || 'Clip sem título'}
      </p>

      {/* CTA */}
      <Link
        to={`/analise/${analysis.id}`}
        className="btn-gold block rounded-xzk px-4 py-2 text-xs text-center mt-auto"
      >
        VER ANÁLISE →
      </Link>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xzk border border-border bg-surface/30 px-5 py-4">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted mb-1">{label}</p>
      <p className="font-mono text-3xl font-bold text-gold tabular-nums">{value}</p>
      {sub && <p className="font-mono text-[0.6rem] text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Historico() {
  const { session, loading: authLoading } = useAuth();
  const { analyses, loading } = useAnalyses(session?.user?.id);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return analyses;
    const q = search.toLowerCase();
    return analyses.filter(
      (a) =>
        (a.form_data?.platform ?? '').toLowerCase().includes(q) ||
        (a.tema ?? '').toLowerCase().includes(q) ||
        (a.form_data?.ai_result?.niche ?? '').toLowerCase().includes(q),
    );
  }, [analyses, search]);

  const stats = useMemo(() => {
    const scores = analyses
      .map((a) => a.form_data?.ai_result?.viral_readiness)
      .filter((s): s is number => typeof s === 'number');
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const best = scores.length ? Math.max(...scores) : null;
    return { total: analyses.length, avg, best };
  }, [analyses]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center gap-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">ClipAnalisis</p>
        <h1 className="text-4xl sm:text-5xl">OS MEUS CLIPS</h1>
        <p className="text-sm text-muted max-w-sm">
          Faz login para acederes ao teu histórico de análises.
        </p>
        <button onClick={() => navigate('/')} className="btn-gold rounded-xzk px-6 py-3 text-sm">
          IR PARA O INÍCIO
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">

        {/* top nav */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted hover:text-gold-hi transition-colors"
          >
            ← VOLTAR
          </button>
          <span className="chip rounded-full px-3 py-1">RAIO-X ClipAnalisis</span>
        </div>

        {/* title */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl">OS MEUS CLIPS<br/>ANALISADOS</h1>
        </div>

        {/* stats */}
        {!loading && stats.total > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <StatCard label="Total de clips" value={stats.total} />
            <StatCard label="Score médio" value={stats.avg !== null ? stats.avg : '—'} sub="/100" />
            <StatCard label="Melhor score" value={stats.best !== null ? stats.best : '—'} sub="/100" />
          </div>
        )}

        {/* search */}
        {analyses.length > 1 && (
          <div className="mb-6">
            <input
              type="search"
              placeholder="Pesquisar por plataforma ou nicho…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface/40 border border-border rounded-xzk px-4 py-2.5 text-sm font-mono text-text placeholder:text-muted outline-none focus:border-gold/40 transition-colors"
            />
          </div>
        )}

        {/* grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-xzk border border-border bg-surface/20 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xzk border border-border bg-surface/30 p-12 text-center">
            <p className="text-3xl mb-3">
              {search ? 'NENHUM RESULTADO' : 'SEM CLIPS AINDA'}
            </p>
            <p className="text-sm text-muted mb-6">
              {search
                ? 'Tenta ajustar a pesquisa.'
                : 'Analisa o teu primeiro clip e recebe o raio-X de viralização.'}
            </p>
            {!search && (
              <button onClick={() => navigate('/')} className="btn-gold rounded-xzk px-6 py-3 text-sm">
                ANALISAR UM CLIP
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => <AnalysisCard key={a.id} analysis={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}

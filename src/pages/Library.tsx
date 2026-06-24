import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Search, Trash2, TrendingUp, ArrowUpDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalyses } from '@/hooks/useAnalyses';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { AnalysisCardSkeleton } from '@/components/ui/Skeleton';
import { useAppToast } from '@/hooks/useAppToast';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Analysis } from '@/types';

type SortKey = 'date_desc' | 'date_asc' | 'score_desc';

function AnalysisRow({
  analysis,
  onView,
  onDelete,
}: {
  analysis: Analysis;
  onView: () => void;
  onDelete: () => void;
}) {
  const fd = analysis.form_data;
  const platform = fd?.platform;
  const aiResult = fd?.ai_result;
  const title = platform
    ? `${platform}${analysis.tema ? ' · ' + analysis.tema : ''}`
    : analysis.tema || 'Clip sem título';

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-[var(--app-radius-md)] hover:bg-app-bg-hover transition-colors group border border-transparent hover:border-app-border-subtle">
      <div className="w-9 h-9 rounded-[var(--app-radius-sm)] bg-app-accent-subtle flex items-center justify-center text-app-accent shrink-0">
        <TrendingUp size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-inter font-medium text-app-text-primary text-sm truncate">{title}</p>
        <p className="font-inter text-app-text-muted text-xs mt-0.5">{formatRelativeTime(analysis.created_at)}</p>
      </div>
      {aiResult && (
        <span className="font-mono font-bold text-gold text-sm shrink-0">
          {aiResult.viral_readiness}
          <span className="text-app-text-muted text-xs font-normal">/100</span>
        </span>
      )}
      <Badge status="done" className="shrink-0 hidden sm:inline-flex" />
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onView}
          className="font-inter text-xs text-app-accent hover:text-app-accent-hover transition-colors px-2 py-1 rounded bg-app-accent-subtle"
        >
          Ver →
        </button>
        <button
          onClick={onDelete}
          aria-label="Eliminar análise"
          className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-app-error hover:bg-app-error/10 rounded transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Library() {
  const { session } = useAuth();
  const { analyses, loading, remove } = useAnalyses(session?.user?.id);
  const navigate = useNavigate();
  const { toast } = useAppToast();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('date_desc');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = analyses;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          (a.form_data?.platform ?? '').toLowerCase().includes(q) ||
          (a.tema ?? '').toLowerCase().includes(q),
      );
    }
    if (sort === 'date_asc') list = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
    else if (sort === 'score_desc')
      list = [...list].sort(
        (a, b) => (b.form_data?.ai_result?.viral_readiness ?? 0) - (a.form_data?.ai_result?.viral_readiness ?? 0),
      );
    return list;
  }, [analyses, search, sort]);

  async function handleDelete(id: string) {
    const err = await remove(id);
    setConfirmDelete(null);
    if (err) toast(`Erro ao eliminar: ${err}`, 'error');
    else toast('Análise eliminada.', 'success');
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-app-text-primary text-2xl">Library</h1>
          <p className="font-inter text-app-text-muted text-sm mt-0.5">{analyses.length} análises</p>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/app/upload')}>
          <Upload size={16} />
          Nova análise
        </Button>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted" />
          <input
            type="search"
            placeholder="Pesquisar por plataforma ou nicho…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-app-bg-card border border-app-border-subtle rounded-[var(--app-radius-md)] pl-9 pr-3 py-2 text-sm font-inter text-app-text-primary placeholder:text-app-text-muted outline-none focus:border-app-accent transition-colors"
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="bg-app-bg-card border border-app-border-subtle rounded-[var(--app-radius-md)] px-3 py-2 text-xs font-inter text-app-text-muted outline-none focus:border-app-accent transition-colors"
          aria-label="Ordenar por"
        >
          <option value="date_desc">Mais recentes</option>
          <option value="date_asc">Mais antigas</option>
          <option value="score_desc">Maior score</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <AnalysisCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ArrowUpDown size={20} />}
          title={search ? 'Nenhum resultado' : 'Sem análises ainda'}
          description={
            search
              ? 'Tenta ajustar os filtros de pesquisa.'
              : 'Faz o upload do teu primeiro clip para ver os resultados aqui.'
          }
          action={
            !search ? (
              <Button variant="primary" onClick={() => navigate('/app/upload')}>
                <Upload size={16} />
                Novo upload
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="divide-y divide-app-border-subtle overflow-hidden">
          {filtered.map((a) => (
            <AnalysisRow
              key={a.id}
              analysis={a}
              onView={() => navigate(`/app/analysis/${a.id}`)}
              onDelete={() => setConfirmDelete(a.id)}
            />
          ))}
        </Card>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-app-bg-card border border-app-border-default rounded-[var(--app-radius-xl)] p-6 max-w-sm w-full shadow-[var(--app-shadow-card)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-grotesk font-bold text-app-text-primary text-base">Eliminar análise?</h3>
            <p className="font-inter text-app-text-muted text-sm mt-2">
              Esta acção é irreversível. O vídeo e o resultado serão apagados permanentemente.
            </p>
            <div className="flex gap-3 mt-5">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => handleDelete(confirmDelete)}>
                <Trash2 size={14} />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

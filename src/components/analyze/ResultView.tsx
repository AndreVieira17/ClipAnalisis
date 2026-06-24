import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  type AiResult,
  type Pilar,
  PILAR_LABEL,
  PILAR_ORDER,
} from '@/lib/analysis-types';

function scoreColor(s: number): string {
  if (s >= 75) return '#D4AF37';
  if (s >= 50) return '#E6C35C';
  if (s >= 30) return '#C9893E';
  return '#E5484D';
}

/** Pillar meter with a count-up number and an animated bar. */
function PillarMeter({ pilar, score, isGargalo }: { pilar: Pilar; score: number; isGargalo: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return setN(score);
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      setN(Math.round(score * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className={`rounded-xzk border p-4 ${isGargalo ? 'border-danger/50 bg-danger/5' : 'border-border bg-surface/40'}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text">{PILAR_LABEL[pilar]}</span>
        <span className="font-mono text-lg font-bold tabular-nums" style={{ color: scoreColor(score) }}>
          {n}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
        <motion.div
          className="h-full rounded-full"
          style={{ background: scoreColor(score) }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {isGargalo && (
        <span className="mt-2 inline-block font-mono text-[0.6rem] uppercase tracking-[0.15em] text-danger">
          ✕ gargalo — mexe aqui primeiro
        </span>
      )}
    </div>
  );
}

/** Retention curve with marked drop points (when metrics were provided). */
function RetentionChart({ result }: { result: AiResult }) {
  const drops = result.retention.drops;
  if (!drops.length) return null;

  // build a simple descending curve through the drop points
  const pts = [{ x: 0, y: 100 }, ...drops.map((d, i) => ({ x: ((i + 1) / (drops.length + 1)) * 100, y: d.to }))];
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${100 - p.y}`).join(' ');

  return (
    <div className="rounded-xzk border border-border bg-surface/40 p-5">
      <h4 className="font-display text-lg uppercase tracking-tight">Curva de retenção</h4>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-3 h-32 w-full">
        <path d={`${path} L 100 100 L 0 100 Z`} fill="rgba(212,175,55,0.12)" />
        <path d={path} fill="none" stroke="#D4AF37" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {pts.slice(1).map((p, i) => (
          <circle key={i} cx={p.x} cy={100 - p.y} r="2" fill="#E5484D" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <ul className="mt-3 space-y-2">
        {drops.map((d, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="font-mono text-danger">{d.ts}</span>
            <span className="leading-relaxed text-text/85">
              <span className="font-semibold text-text">{d.from}%→{d.to}%</span> — {d.causa_provavel}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chips({ title, items }: { title: string; items: { title: string; url: string; motivo?: string }[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="font-display text-sm uppercase tracking-tight text-muted">{title}</h4>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((it, i) => (
          <a
            key={i}
            href={it.url || '#'}
            target="_blank"
            rel="noreferrer"
            title={it.motivo}
            className="chip rounded-full px-3 py-1.5 transition-colors hover:border-gold/50 hover:text-gold-hi"
          >
            {it.title}
          </a>
        ))}
      </div>
    </div>
  );
}

const CONF_LABEL: Record<string, string> = {
  alta: 'Confiança alta — ancorado em métricas reais',
  média: 'Confiança média — sem métricas, leitura da edição',
  baixa: 'Confiança baixa — dados limitados',
};

export function ResultView({ result }: { result: AiResult }) {
  return (
    <div className="space-y-8">
      {/* score headline */}
      <div className="text-center">
        <span className="chip rounded-full px-3 py-1">VIRAL READINESS{result.niche ? ' · ' + result.niche.toUpperCase() : ''}</span>
        <div className="mt-4 num-glow gold-foil font-mono text-7xl font-bold tabular-nums">
          {result.viral_readiness}
          <span className="text-2xl text-muted">/100</span>
        </div>
        <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted">
          {CONF_LABEL[result.confidence] ?? result.confidence}
        </p>
        <p className="mx-auto mt-4 max-w-lg text-lg text-text">{result.veredicto}</p>
      </div>

      {/* pillars */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PILAR_ORDER.map((p) => (
          <PillarMeter key={p} pilar={p} score={result.pilares[p].score} isGargalo={result.gargalo === p} />
        ))}
      </div>

      <RetentionChart result={result} />

      {/* evidence per pillar */}
      <div className="space-y-3">
        <h4 className="font-display text-xl uppercase tracking-tight">Evidência frame a frame</h4>
        {PILAR_ORDER.map((p) => (
          <details key={p} className="group rounded-xzk border border-border bg-surface/40 p-4">
            <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold">
              {PILAR_LABEL[p]}
              <span className="font-mono" style={{ color: scoreColor(result.pilares[p].score) }}>
                {result.pilares[p].score}
              </span>
            </summary>
            <ul className="mt-3 space-y-2">
              {result.pilares[p].evidencia.map((e, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-text/85">
                  <span className="shrink-0 font-mono text-gold">{e.ts}</span>
                  <span>{e.obs}</span>
                </li>
              ))}
            </ul>
            {result.pilares[p].fix && (
              <p className="mt-3 rounded bg-gold/5 p-2 text-sm text-text">
                <span className="font-semibold text-gold">Fix:</span> {result.pilares[p].fix}
              </p>
            )}
          </details>
        ))}
      </div>

      {/* priority fixes */}
      {result.correcoes_prioritarias.length > 0 && (
        <div>
          <h4 className="font-display text-xl uppercase tracking-tight">Correções prioritárias</h4>
          <ol className="mt-3 space-y-3">
            {result.correcoes_prioritarias.map((c, i) => (
              <li key={i} className="rounded-xzk border border-border bg-surface/40 p-4">
                <span className="num-glow gold-foil font-mono text-sm font-bold">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-1 font-semibold text-text">{c.titulo}</p>
                <p className="mt-1 text-sm leading-relaxed text-text/85">{c.oquefazer}</p>
                <p className="mt-1 text-sm text-gold/90">Por quê: {c.porque}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* edit plan (elite) */}
      {result.edit_plan && result.edit_plan.length > 0 && (
        <div>
          <h4 className="font-display text-xl uppercase tracking-tight">Roteiro de edição</h4>
          <div className="mt-3 space-y-2 border-l-2 border-gold/40 pl-4">
            {result.edit_plan.map((s, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[1.45rem] top-1 h-2 w-2 rounded-full bg-gold" />
                <span className="font-mono text-xs text-gold">{s.ts_inicio}–{s.ts_fim}</span>
                <p className="text-sm font-semibold text-text">{s.acao}</p>
                <p className="text-sm text-muted">{s.detalhe}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* growth strategies */}
      {result.estrategias_crescimento && result.estrategias_crescimento.length > 0 && (
        <div>
          <h4 className="font-display text-xl uppercase tracking-tight">Estratégias de crescimento</h4>
          <ul className="mt-3 space-y-2">
            {result.estrategias_crescimento.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-text">
                <span className="text-gold">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* curated links */}
      <div className="space-y-4">
        <Chips title="Áudios sugeridos" items={result.audios_sugeridos} />
        <Chips title="Fontes" items={result.fontes} />
        <Chips title="Tutoriais" items={result.tutoriais} />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  type AiResult,
  type Topico,
  type Pilar,
  type PotencialViral,
  PILAR_LABEL,
  PILAR_ORDER,
  PILAR_WEIGHTS,
} from '@/lib/analysis-types';

// ── Font constants (applied via inline style — eliminates specificity fights) ──
const F_SCORE_BIG  = { fontFamily: "'Inter', sans-serif", fontWeight: 900 } as const;
const F_LABEL_SM   = { fontFamily: "'Inter', sans-serif", fontWeight: 500, letterSpacing: '0.15em' } as const;
const F_HEADING_H2 = { fontFamily: "'Montserrat', sans-serif", fontWeight: 700 } as const;
const F_TITLE_NICHE = { fontFamily: "'Montserrat', sans-serif", fontWeight: 800 } as const;
const F_TOPIC_NAME = { fontFamily: "'Inter', sans-serif", fontWeight: 600 } as const;
const F_FEEDBACK   = { fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '14px' } as const;
const F_INTER_600  = { fontFamily: "'Inter', sans-serif", fontWeight: 600 } as const;
const F_INTER_500  = { fontFamily: "'Inter', sans-serif", fontWeight: 500 } as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 76) return '#22c55e';
  if (s >= 61) return '#D4AF37';
  if (s >= 41) return '#F59E0B';
  return '#EF4444';
}

function scoreLabel(s: number): string {
  if (s >= 76) return 'Muito Bom';
  if (s >= 61) return 'Bom';
  if (s >= 41) return 'Médio';
  if (s >= 21) return 'Fraco';
  return 'Crítico';
}

function CountUp({ target, duration = 900 }: { target: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return setN(target);
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      setN(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{n}</>;
}

function AnimBar({ score, delay = 0 }: { score: number; delay?: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
      <motion.div
        className="h-full rounded-full"
        style={{ background: scoreColor(score) }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      />
    </div>
  );
}

// ── NEW: 20-topic card ────────────────────────────────────────────────────────

function TopicoCard({ topico, index }: { topico: Topico; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="rounded-xzk border border-border bg-surface/30 overflow-hidden"
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface/50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {/* score number */}
        <span
          className="text-xl tabular-nums w-12 shrink-0"
          style={{ ...F_SCORE_BIG, color: scoreColor(topico.score) }}
        >
          <CountUp target={topico.score} duration={600} />
        </span>

        {/* label + bar */}
        <div className="flex-1 min-w-0">
          <p className="leading-tight mb-1.5 truncate text-text" style={F_TOPIC_NAME}>
            {topico.label}
          </p>
          <AnimBar score={topico.score} delay={index * 0.04} />
        </div>

        {/* badge + toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="hidden sm:block text-[0.6rem] uppercase px-1.5 py-0.5 rounded"
            style={{ ...F_LABEL_SM, letterSpacing: '0.1em', color: scoreColor(topico.score), background: `${scoreColor(topico.score)}18` }}
          >
            {scoreLabel(topico.score)}
          </span>
          <span className="text-muted text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-3">
          {topico.feedback && (
            <p className="text-muted leading-relaxed" style={F_FEEDBACK}>
              {topico.feedback}
            </p>
          )}
          {topico.sugestoes.length > 0 && (
            <ul className="space-y-2">
              {topico.sugestoes.map((s, i) => (
                <li key={i} className="flex gap-2 leading-snug text-text/80" style={F_FEEDBACK}>
                  <span className="text-gold shrink-0 mt-0.5" style={F_INTER_600}>→</span>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── LEGACY: 6-pillar card ─────────────────────────────────────────────────────

function PillarCard({ pilar, result }: { pilar: Pilar; result: AiResult }) {
  const pr = result.pilares![pilar];
  const weight = PILAR_WEIGHTS[pilar];
  return (
    <div className="rounded-xzk border border-border bg-surface/30 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-text text-sm" style={F_TOPIC_NAME}>{PILAR_LABEL[pilar]}</p>
          <p className="text-[0.65rem] text-muted mt-0.5" style={F_INTER_500}>peso {weight}%</p>
        </div>
        <div className="text-right shrink-0">
          <span
            className="text-2xl tabular-nums"
            style={{ ...F_SCORE_BIG, color: scoreColor(pr.score) }}
          >
            <CountUp target={pr.score} />
          </span>
        </div>
      </div>
      <AnimBar score={pr.score} />
      {pr.fix && (
        <p className="leading-relaxed border-t border-border/50 pt-2 text-muted" style={F_FEEDBACK}>
          {pr.fix}
        </p>
      )}
    </div>
  );
}

// ── Links curados ─────────────────────────────────────────────────────────────

function LinkChips({ title, items }: { title: string; items: { title: string; url: string; motivo?: string }[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p
        className="text-muted uppercase mb-2"
        style={{ ...F_HEADING_H2, fontSize: '0.65rem', letterSpacing: '0.15em' }}
      >
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <a
            key={i}
            href={it.url || '#'}
            target="_blank"
            rel="noreferrer"
            title={it.motivo}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface/30 px-3 py-1 text-muted hover:border-gold/50 hover:text-gold-hi transition-colors"
            style={{ ...F_FEEDBACK, fontSize: '0.75rem' }}
          >
            {it.title} <span className="opacity-40">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Potencial Viral block ─────────────────────────────────────────────────────

function PotencialViralBlock({ pv }: { pv: PotencialViral }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-xzk border p-5"
      style={{ borderColor: 'rgba(212,175,55,0.35)', background: 'rgba(212,175,55,0.05)' }}
    >
      {/* header */}
      <div className="flex items-center gap-2 mb-5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M13 2L4.09 12.11a1 1 0 00.77 1.65H11l-1 8 8.92-10.11a1 1 0 00-.77-1.65H13l1-8z"
            fill="#D4AF37" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span
          className="uppercase text-gold"
          style={{ ...F_HEADING_H2, fontSize: '0.75rem', letterSpacing: '0.18em' }}
        >
          Potencial do Clip
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Antes */}
        <div
          className="rounded-lg p-4"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p
            className="uppercase mb-3"
            style={{ ...F_LABEL_SM, fontSize: '0.6rem', color: '#888', letterSpacing: '0.15em' }}
          >
            Clip atual
          </p>
          <p className="text-text/90 text-lg tabular-nums" style={{ ...F_SCORE_BIG, fontSize: '1.4rem' }}>
            {pv.alcance_atual}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'rgba(212,175,55,0.5)' }}
                initial={{ width: 0 }}
                animate={{ width: `${pv.prob_atual}%` }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            <span style={{ ...F_INTER_500, fontSize: '12px', color: '#888' }}>{pv.prob_atual}%</span>
          </div>
          <p style={{ ...F_INTER_500, fontSize: '11px', color: '#666', marginTop: '4px' }}>
            probabilidade de atingir este range
          </p>
        </div>

        {/* Depois */}
        <div
          className="rounded-lg p-4"
          style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <p
            className="uppercase mb-3"
            style={{ ...F_LABEL_SM, fontSize: '0.6rem', color: '#D4AF37CC', letterSpacing: '0.15em' }}
          >
            Após correcções
          </p>
          <p className="tabular-nums" style={{ ...F_SCORE_BIG, fontSize: '1.4rem', color: '#D4AF37' }}>
            {pv.alcance_otimizado}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #b8960c, #D4AF37)' }}
                initial={{ width: 0 }}
                animate={{ width: `${pv.prob_otimizado}%` }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.35 }}
              />
            </div>
            <span style={{ ...F_INTER_500, fontSize: '12px', color: '#D4AF37BB' }}>{pv.prob_otimizado}%</span>
          </div>
          <p style={{ ...F_INTER_500, fontSize: '11px', color: '#D4AF3766', marginTop: '4px' }}>
            probabilidade de atingir este range
          </p>
        </div>
      </div>

      {pv.resumo && (
        <p className="mt-4 leading-relaxed text-muted/80" style={{ ...F_FEEDBACK, fontSize: '13px' }}>
          {pv.resumo}
        </p>
      )}
    </motion.div>
  );
}

// ── Section heading helper ────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg text-text mb-4" style={F_HEADING_H2}>
      {children}
    </h2>
  );
}

// ── Main ResultView ───────────────────────────────────────────────────────────

export function ResultView({ result }: { result: AiResult }) {
  const hasNewStructure = Boolean(result.topicos && result.topicos.length >= 10);

  // Debug: log potencial_viral so we can confirm it arrives from the API
  console.log('[ResultView] potencial_viral:', result.potencial_viral ?? 'UNDEFINED — edge function not redeployed or old cached analysis');

  return (
    <div className="space-y-10">

      {/* ── Score global ── */}
      <div className="text-center py-6">
        {result.niche && (
          <span
            className="inline-block text-muted mb-4 border border-border rounded-full px-3 py-1 text-[0.7rem] uppercase"
            style={F_TITLE_NICHE}
          >
            {result.niche}
          </span>
        )}

        <div
          className="text-[8rem] sm:text-[10rem] leading-none tabular-nums"
          style={{ ...F_SCORE_BIG, color: scoreColor(result.viral_readiness) }}
        >
          <CountUp target={result.viral_readiness} />
          <span
            className="text-[2.5rem] text-muted/60"
            style={F_SCORE_BIG}
          >
            /100
          </span>
        </div>

        <p
          className="uppercase text-muted mt-1"
          style={{ ...F_LABEL_SM, fontSize: '0.7rem' }}
        >
          VIRAL READINESS SCORE
        </p>

        <p className="text-text/80 leading-relaxed mt-4 max-w-xl mx-auto" style={{ ...F_FEEDBACK, fontSize: '15px' }}>
          {result.veredicto}
        </p>
      </div>

      {/* ── Potencial viral ── */}
      {result.potencial_viral && result.potencial_viral.alcance_atual && (
        <PotencialViralBlock pv={result.potencial_viral} />
      )}

      {/* ── 20 topic cards (new) ── */}
      {hasNewStructure && result.topicos && (
        <div>
          <SectionTitle>Análise dos 20 tópicos</SectionTitle>
          <p className="text-muted mb-4" style={{ ...F_FEEDBACK, fontSize: '13px' }}>
            Clica em cada tópico para ver o feedback e sugestões.
          </p>
          <div className="space-y-2">
            {result.topicos.map((t, i) => (
              <TopicoCard key={t.id} topico={t} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Legacy 6-pillar cards ── */}
      {!hasNewStructure && result.pilares && (
        <div>
          <SectionTitle>Análise por categoria</SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PILAR_ORDER.map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <PillarCard pilar={p} result={result} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Correções prioritárias ── */}
      {result.correcoes_prioritarias.length > 0 && (
        <div>
          <SectionTitle>Correções prioritárias</SectionTitle>
          <ol className="space-y-3">
            {result.correcoes_prioritarias.map((c, i) => (
              <li key={i} className="flex gap-4 rounded-xzk border border-border bg-surface/30 p-4">
                <span
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs text-black"
                  style={{ ...F_INTER_600, background: scoreColor(90 - i * 8) }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-text" style={{ ...F_INTER_600, fontSize: '14px' }}>{c.titulo}</p>
                  <p className="text-muted leading-relaxed mt-1" style={F_FEEDBACK}>{c.oquefazer}</p>
                  <p className="text-gold/80 mt-1.5" style={{ ...F_INTER_500, fontSize: '13px' }}>Por quê: {c.porque}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Estratégias de crescimento ── */}
      {result.estrategias_crescimento && result.estrategias_crescimento.length > 0 && (
        <div>
          <SectionTitle>Estratégias de crescimento</SectionTitle>
          <ul className="space-y-2">
            {result.estrategias_crescimento.map((s, i) => (
              <li key={i} className="flex gap-3 text-muted leading-relaxed" style={F_FEEDBACK}>
                <span className="text-gold shrink-0 mt-0.5" style={F_INTER_600}>→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Plano 7 dias (Elite) ── */}
      {result.plano_acao_7dias && result.plano_acao_7dias.length > 0 && (
        <div>
          <SectionTitle>Plano de acção — 7 dias</SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {result.plano_acao_7dias.map((d, i) => (
              <div key={i} className="rounded-xzk border border-border bg-surface/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-gold bg-gold/10 rounded px-1.5 py-0.5 uppercase"
                    style={{ ...F_LABEL_SM, fontSize: '0.6rem' }}
                  >
                    DIA {d.dia}
                  </span>
                  <span className="text-text" style={{ ...F_INTER_600, fontSize: '14px' }}>{d.foco}</span>
                </div>
                <p className="text-muted leading-relaxed" style={F_FEEDBACK}>{d.tarefa}</p>
                {d.meta && (
                  <p className="mt-1.5" style={{ ...F_INTER_500, fontSize: '13px', color: '#D4AF37CC' }}>
                    <span style={F_INTER_600}>Meta:</span> {d.meta}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Edit plan (se presente) ── */}
      {result.edit_plan && result.edit_plan.length > 0 && (
        <div>
          <SectionTitle>Roteiro de edição</SectionTitle>
          <div className="space-y-2 border-l-2 border-gold/30 pl-4">
            {result.edit_plan.map((s, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-gold" />
                <span className="text-gold" style={{ ...F_INTER_500, fontSize: '12px' }}>
                  {s.ts_inicio}–{s.ts_fim}
                </span>
                <p className="text-text" style={{ ...F_INTER_600, fontSize: '14px' }}>{s.acao}</p>
                <p className="text-muted" style={F_FEEDBACK}>{s.detalhe}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Links curados ── */}
      {(result.audios_sugeridos.length > 0 || result.fontes.length > 0 || result.tutoriais.length > 0) && (
        <div className="space-y-4 rounded-xzk border border-border bg-surface/20 p-5">
          <LinkChips title="Áudios sugeridos" items={result.audios_sugeridos} />
          <LinkChips title="Fontes" items={result.fontes} />
          <LinkChips title="Tutoriais" items={result.tutoriais} />
        </div>
      )}

    </div>
  );
}

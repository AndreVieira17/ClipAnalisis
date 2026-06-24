// Tolerant JSON normalizer + validator. Models drift; we coerce their output
// into a valid AiResult, recompute the weighted score from the pillars (so the
// number is always consistent with the rubric), and clamp everything.

import {
  type AiResult,
  type Confidence,
  type Pilar,
  type PilarResult,
  PILARES,
  PILAR_WEIGHTS,
} from './types.ts';

export function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // last resort: grab the outermost { ... }
    const first = trimmed.indexOf('{');
    const last = trimmed.lastIndexOf('}');
    if (first !== -1 && last > first) return JSON.parse(trimmed.slice(first, last + 1));
    throw new Error('No JSON object found in model output');
  }
}

const clamp = (n: unknown, lo = 0, hi = 100): number => {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(lo, Math.min(hi, Math.round(v)));
};

const asArray = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const asStr = (v: unknown, fb = ''): string => (typeof v === 'string' ? v : fb);

function normPilar(v: unknown): PilarResult {
  const o = (v ?? {}) as Record<string, unknown>;
  return {
    score: clamp(o.score),
    evidencia: asArray<Record<string, unknown>>(o.evidencia).map((e) => ({
      ts: asStr(e.ts),
      obs: asStr(e.obs),
    })),
    fix: asStr(o.fix),
  };
}

const VALID_CONF: Confidence[] = ['alta', 'média', 'baixa'];

/** Coerce arbitrary model output into a valid, internally-consistent AiResult. */
export function normalize(input: unknown, hasMetrics: boolean): AiResult {
  const o = (input ?? {}) as Record<string, unknown>;

  const pilares = {} as Record<Pilar, PilarResult>;
  for (const p of PILARES) pilares[p] = normPilar((o.pilares as Record<string, unknown>)?.[p]);

  // recompute weighted score from pillar scores → never trust the model's math
  let weighted = 0;
  let totalW = 0;
  for (const p of PILARES) {
    weighted += pilares[p].score * PILAR_WEIGHTS[p];
    totalW += PILAR_WEIGHTS[p];
  }
  const viral = Math.round(weighted / totalW);

  // gargalo = lowest-scoring pillar weighted by importance (biggest leverage)
  let gargalo: Pilar = 'headline';
  let worst = Infinity;
  for (const p of PILARES) {
    const impact = pilares[p].score - PILAR_WEIGHTS[p]; // low score + high weight = priority
    if (impact < worst) {
      worst = impact;
      gargalo = p;
    }
  }

  const conf = asStr(o.confidence) as Confidence;

  return {
    niche: asStr(o.niche, 'geral'),
    has_metrics: hasMetrics,
    viral_readiness: viral,
    confidence: VALID_CONF.includes(conf) ? conf : hasMetrics ? 'alta' : 'média',
    retention: {
      drops: asArray<Record<string, unknown>>((o.retention as Record<string, unknown>)?.drops).map((d) => ({
        ts: asStr(d.ts),
        from: clamp(d.from),
        to: clamp(d.to),
        causa_provavel: asStr(d.causa_provavel),
      })),
    },
    pilares,
    gargalo: PILARES.includes(asStr(o.gargalo) as Pilar) ? (asStr(o.gargalo) as Pilar) : gargalo,
    veredicto: asStr(o.veredicto),
    correcoes_prioritarias: asArray<Record<string, unknown>>(o.correcoes_prioritarias).map((c) => ({
      titulo: asStr(c.titulo),
      oquefazer: asStr(c.oquefazer),
      porque: asStr(c.porque),
    })),
    estrategias_crescimento: asArray<unknown>(o.estrategias_crescimento).map((s) => asStr(s)).filter(Boolean),
    audios_sugeridos: asArray<Record<string, unknown>>(o.audios_sugeridos).map((a) => ({
      title: asStr(a.title),
      url: asStr(a.url),
      motivo: asStr(a.motivo),
    })),
    fontes: asArray<Record<string, unknown>>(o.fontes).map((f) => ({ title: asStr(f.title), url: asStr(f.url) })),
    tutoriais: asArray<Record<string, unknown>>(o.tutoriais).map((t) => ({ title: asStr(t.title), url: asStr(t.url) })),
    edit_plan: asArray<Record<string, unknown>>(o.edit_plan).map((e) => ({
      ts_inicio: asStr(e.ts_inicio),
      ts_fim: asStr(e.ts_fim),
      acao: asStr(e.acao),
      detalhe: asStr(e.detalhe),
    })),
  };
}

/** Sanity gate: did the model actually produce evidence-backed pillars? */
export function isUsable(r: AiResult): boolean {
  const anyEvidence = PILARES.some((p) => r.pilares[p].evidencia.length > 0);
  const anyScore = PILARES.some((p) => r.pilares[p].score > 0);
  return anyEvidence && anyScore && r.veredicto.length > 0;
}

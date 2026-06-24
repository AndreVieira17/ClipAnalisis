// Shared engine types. Mirrored on the frontend in src/lib/analysis-types.ts.

export type PlanTier = 'free' | 'starter' | 'pro' | 'elite';
export type Pilar = 'headline' | 'legenda' | 'fala' | 'musica' | 'efeitos' | 'final';
export type Confidence = 'alta' | 'média' | 'baixa';

export interface Evidencia {
  ts: string; // "0:00-0:03"
  obs: string;
}

export interface PilarResult {
  score: number; // 0-100
  evidencia: Evidencia[];
  fix: string;
}

export interface RetentionDrop {
  ts: string;
  from: number;
  to: number;
  causa_provavel: string;
}

export interface Correcao {
  titulo: string;
  oquefazer: string;
  porque: string;
}

export interface AudioSug {
  title: string;
  url: string;
  motivo: string;
}

export interface LinkItem {
  title: string;
  url: string;
}

export interface EditStep {
  ts_inicio: string;
  ts_fim: string;
  acao: string;
  detalhe: string;
}

export interface AiResult {
  niche: string;
  has_metrics: boolean;
  viral_readiness: number; // 0-100 weighted
  confidence: Confidence;
  retention: { drops: RetentionDrop[] };
  pilares: Record<Pilar, PilarResult>;
  gargalo: Pilar;
  veredicto: string;
  correcoes_prioritarias: Correcao[];
  estrategias_crescimento?: string[]; // extra block (free/pro/elite)
  audios_sugeridos: AudioSug[];
  fontes: LinkItem[];
  tutoriais: LinkItem[];
  edit_plan?: EditStep[]; // elite only
}

// Pillar weights → weighted Viral Readiness Score.
export const PILAR_WEIGHTS: Record<Pilar, number> = {
  headline: 30,
  legenda: 15,
  fala: 15,
  musica: 15,
  efeitos: 15,
  final: 10,
};

export const PILARES: Pilar[] = ['headline', 'legenda', 'fala', 'musica', 'efeitos', 'final'];

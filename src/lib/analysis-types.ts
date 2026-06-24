// Frontend mirror of the engine output (supabase/functions/_shared/types.ts).

export type PlanTier = 'free' | 'starter' | 'pro' | 'elite';
export type Pilar = 'headline' | 'legenda' | 'fala' | 'musica' | 'efeitos' | 'final';
export type Confidence = 'alta' | 'média' | 'baixa';

export interface Evidencia {
  ts: string;
  obs: string;
}
export interface PilarResult {
  score: number;
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
  viral_readiness: number;
  confidence: Confidence;
  retention: { drops: RetentionDrop[] };
  pilares: Record<Pilar, PilarResult>;
  gargalo: Pilar;
  veredicto: string;
  correcoes_prioritarias: Correcao[];
  estrategias_crescimento?: string[];
  audios_sugeridos: AudioSug[];
  fontes: LinkItem[];
  tutoriais: LinkItem[];
  edit_plan?: EditStep[];
}

export const PILAR_LABEL: Record<Pilar, string> = {
  headline: 'Headline / Hook',
  legenda: 'Legenda',
  fala: 'Fala',
  musica: 'Música de fundo',
  efeitos: 'Efeitos',
  final: 'Final',
};

export const PILAR_ORDER: Pilar[] = ['headline', 'legenda', 'fala', 'musica', 'efeitos', 'final'];

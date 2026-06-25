// Frontend mirror of supabase/functions/_shared/types.ts

export type PlanTier = 'free' | 'starter' | 'pro' | 'elite';
export type Confidence = 'alta' | 'média' | 'baixa';

// ── NEW: 20-topic flat structure ──────────────────────────────────────────────

export interface Topico {
  id: string;
  label: string;
  score: number;       // 0-100
  feedback: string;
  sugestoes: string[];
}

export const TOPICOS_CONFIG: { id: string; label: string; weight: number }[] = [
  { id: 'hook_abertura',      label: 'Hook / Abertura',                   weight: 8 },
  { id: 'titulo_legenda',     label: 'Título e Legenda',                  weight: 5 },
  { id: 'ritmo_cortes',       label: 'Ritmo e Cortes',                    weight: 6 },
  { id: 'zooms_camera',       label: 'Zooms e Movimentos de Câmara',      weight: 4 },
  { id: 'qualidade_imagem',   label: 'Qualidade de Imagem e Cor',         weight: 4 },
  { id: 'iluminacao',         label: 'Iluminação',                        weight: 3 },
  { id: 'audio_musica',       label: 'Áudio e Música',                    weight: 5 },
  { id: 'voz_energia',        label: 'Voz e Energia',                     weight: 6 },
  { id: 'legendas_video',     label: 'Legendas no Vídeo',                 weight: 5 },
  { id: 'efeitos_visuais',    label: 'Efeitos Visuais',                   weight: 4 },
  { id: 'storytelling',       label: 'Storytelling e Narrativa',          weight: 7 },
  { id: 'duracao_pacing',     label: 'Duração e Pacing',                  weight: 4 },
  { id: 'call_to_action',     label: 'Call to Action',                    weight: 6 },
  { id: 'originalidade',      label: 'Originalidade',                     weight: 4 },
  { id: 'emocao',             label: 'Emoção Transmitida',                weight: 5 },
  { id: 'retencao_30s',       label: 'Retenção (primeiros 30s)',          weight: 8 },
  { id: 'potencial_partilha', label: 'Potencial de Partilha',             weight: 5 },
  { id: 'trending',           label: 'Trending e Relevância',             weight: 4 },
  { id: 'formato',            label: 'Formato e Enquadramento (9:16)',     weight: 3 },
  { id: 'conclusao_final',    label: 'Conclusão e Final do Clip',         weight: 4 },
];

// ── LEGACY: 6-pillar structure ────────────────────────────────────────────────

export type Pilar = 'headline' | 'legenda' | 'fala' | 'musica' | 'efeitos' | 'final';

export interface Evidencia { ts: string; obs: string; }
export interface Subtopico { score: number; evidencia: string; fix: string; }
export interface PilarResult {
  score: number;
  evidencia: Evidencia[];
  fix: string;
  subtopicos?: Record<string, Subtopico>;
}

export const PILAR_LABEL: Record<Pilar, string> = {
  headline: 'Headline / Hook', legenda: 'Legenda', fala: 'Fala',
  musica: 'Música de fundo', efeitos: 'Efeitos', final: 'Final',
};
export const PILAR_ORDER: Pilar[] = ['headline', 'legenda', 'fala', 'musica', 'efeitos', 'final'];
export const PILAR_WEIGHTS: Record<Pilar, number> = {
  headline: 30, legenda: 15, fala: 15, musica: 15, efeitos: 15, final: 10,
};

// ── Shared types ──────────────────────────────────────────────────────────────

export interface RetentionDrop { ts: string; from: number; to: number; causa_provavel: string; }
export interface Correcao { titulo: string; oquefazer: string; porque: string; }
export interface AudioSug { title: string; url: string; motivo: string; }
export interface LinkItem { title: string; url: string; }
export interface EditStep { ts_inicio: string; ts_fim: string; acao: string; detalhe: string; }
export interface AcaoDia { dia: number; foco: string; tarefa: string; meta: string; }

export interface AiResult {
  niche: string;
  has_metrics: boolean;
  viral_readiness: number;
  confidence: Confidence;
  veredicto: string;
  // New: 20 flat topics
  topicos?: Topico[];
  // Legacy: 6 pillars
  retention?: { drops: RetentionDrop[] };
  pilares?: Record<Pilar, PilarResult>;
  gargalo?: Pilar | string;
  // Common
  correcoes_prioritarias: Correcao[];
  estrategias_crescimento?: string[];
  audios_sugeridos: AudioSug[];
  fontes: LinkItem[];
  tutoriais: LinkItem[];
  edit_plan?: EditStep[];
  plano_acao_7dias?: AcaoDia[];
}

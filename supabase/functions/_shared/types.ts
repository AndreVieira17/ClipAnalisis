// Shared engine types. Mirrored on the frontend in src/lib/analysis-types.ts.

export type PlanTier = 'free' | 'starter' | 'pro' | 'elite';
export type Confidence = 'alta' | 'média' | 'baixa';

// ── NEW: 20-topic flat structure ──────────────────────────────────────────────

export interface Topico {
  id: string;       // e.g. "hook_abertura"
  label: string;    // e.g. "Hook / Abertura"
  score: number;    // 0-100
  feedback: string; // 1-4 sentences depending on plan
  sugestoes: string[]; // 1 (free/starter) or 2-3 (pro/elite)
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
]; // weights sum to 100

export const TOPIC_WEIGHT: Record<string, number> = Object.fromEntries(
  TOPICOS_CONFIG.map((t) => [t.id, t.weight])
);
export const TOPIC_LABEL: Record<string, string> = Object.fromEntries(
  TOPICOS_CONFIG.map((t) => [t.id, t.label])
);

// ── LEGACY: 6-pillar structure (kept for backward compat with old stored analyses) ──

export type Pilar = 'headline' | 'legenda' | 'fala' | 'musica' | 'efeitos' | 'final';

export interface Evidencia { ts: string; obs: string; }
export interface Subtopico { score: number; evidencia: string; fix: string; }
export interface PilarResult {
  score: number;
  evidencia: Evidencia[];
  fix: string;
  subtopicos?: Record<string, Subtopico>;
}

export const PILAR_WEIGHTS: Record<Pilar, number> = {
  headline: 30, legenda: 15, fala: 15, musica: 15, efeitos: 15, final: 10,
};
export const PILARES: Pilar[] = ['headline', 'legenda', 'fala', 'musica', 'efeitos', 'final'];
export const SUBTOPICOS: Record<Pilar, { key: string; label: string }[]> = {
  headline: [
    { key: 'primeiro_frame', label: 'Primeiro frame visual' },
    { key: 'headline_texto', label: 'Texto / headline' },
    { key: 'promessa', label: 'Promessa de valor' },
    { key: 'pattern_interrupt', label: 'Padrão de interrupção' },
    { key: 'timing_gancho', label: 'Timing do gancho (<3s)' },
    { key: 'tensao_inicial', label: 'Tensão / conflito inicial' },
  ],
  legenda: [
    { key: 'presenca', label: 'Presença de legendas' },
    { key: 'sincronizacao', label: 'Sincronização fala-texto' },
    { key: 'destaque_visual', label: 'Destaque visual' },
    { key: 'legibilidade', label: 'Legibilidade' },
    { key: 'ritmo_texto', label: 'Ritmo do texto em tela' },
  ],
  fala: [
    { key: 'clareza', label: 'Clareza' },
    { key: 'ritmo_fala', label: 'Ritmo' },
    { key: 'densidade', label: 'Densidade de valor' },
    { key: 'silêncios', label: 'Eliminação de silêncios' },
    { key: 'narrativa', label: 'Narrativa' },
    { key: 'cta_verbal', label: 'CTA verbal' },
  ],
  musica: [
    { key: 'adequacao_nicho', label: 'Adequação ao nicho' },
    { key: 'energia', label: 'Energia' },
    { key: 'sync_cortes', label: 'Sync com cortes' },
    { key: 'tendencia', label: 'Tendência' },
  ],
  efeitos: [
    { key: 'freq_cortes', label: 'Frequência de cortes' },
    { key: 'zooms', label: 'Zooms' },
    { key: 'transicoes', label: 'Transições' },
    { key: 'sobreposicoes', label: 'Sobreposições' },
    { key: 'qualidade_visual', label: 'Qualidade visual' },
    { key: 'pacing_visual', label: 'Pacing visual' },
    { key: 'efeitos_sonoros', label: 'Efeitos sonoros' },
  ],
  final: [
    { key: 'loop', label: 'Loop / re-watch' },
    { key: 'cta_final', label: 'CTA final' },
    { key: 'recompensa', label: 'Recompensa emocional' },
    { key: 'cliffhanger', label: 'Cliffhanger' },
    { key: 'duracao', label: 'Duração ideal' },
    { key: 'potencial_viral', label: 'Potencial viral' },
  ],
};

// ── Shared result types ───────────────────────────────────────────────────────

export interface RetentionDrop { ts: string; from: number; to: number; causa_provavel: string; }
export interface Correcao { titulo: string; oquefazer: string; porque: string; }
export interface AudioSug { title: string; url: string; motivo: string; }
export interface LinkItem { title: string; url: string; }
export interface EditStep { ts_inicio: string; ts_fim: string; acao: string; detalhe: string; }
export interface AcaoDia { dia: number; foco: string; tarefa: string; meta: string; }

export interface PotencialViral {
  alcance_atual: string;       // e.g. "500–2.000 views"
  prob_atual: number;          // 0-100
  alcance_otimizado: string;   // e.g. "15.000–50.000 views"
  prob_otimizado: number;      // 0-100
  resumo: string;              // 1-2 frases honestas
}

export interface AiResult {
  niche: string;
  has_metrics: boolean;
  viral_readiness: number; // 0-100 weighted average
  confidence: Confidence;
  veredicto: string;
  // New structure (20 topics)
  topicos?: Topico[];
  // Legacy structure (6 pillars) — kept for old stored analyses
  retention?: { drops: RetentionDrop[] };
  pilares?: Record<Pilar, PilarResult>;
  gargalo?: Pilar | string;
  // Common sections
  potencial_viral?: PotencialViral;
  correcoes_prioritarias: Correcao[];
  estrategias_crescimento?: string[];
  audios_sugeridos: AudioSug[];
  fontes: LinkItem[];
  tutoriais: LinkItem[];
  edit_plan?: EditStep[];
  plano_acao_7dias?: AcaoDia[];
}

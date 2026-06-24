import type { AiResult, PlanTier } from '@/lib/analysis-types';

export type { PlanTier, AiResult };

// Stored inside the analyses.form_data JSONB column
export interface AnalysisFormData {
  ai_result: AiResult | null;
  video_path: string | null;
  source_url: string | null;
  platform: string | null;
}

// Mirrors the REAL analyses table: id, user_id, plan, tema, duracao, form_data, created_at
export interface Analysis {
  id: string;
  user_id: string;
  plan: PlanTier;
  tema: string | null;
  duracao: number | null;
  form_data: AnalysisFormData | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  plan: PlanTier;
  created_at: string;
}

export interface Quota {
  remaining: number | null;
  limit: number | null;
}

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

// Derived — analyses always exist as completed rows (inserted only on success)
export type AnalysisStatus = 'done' | 'error';

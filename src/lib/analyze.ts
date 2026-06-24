import { supabase } from '@/lib/supabase';
import type { AiResult, PlanTier } from '@/lib/analysis-types';

export const LIMITS = {
  videoMaxBytes: 100 * 1024 * 1024,
  videoMaxSeconds: 90,
  videoTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
};

/** Validates type/size and reads duration from a temporary <video>. Returns [error, durationSeconds]. */
export function validateVideo(file: File): Promise<[string | null, number]> {
  return new Promise((resolve) => {
    if (!LIMITS.videoTypes.includes(file.type)) return resolve(['Vídeo precisa ser MP4, MOV ou WEBM.', 0]);
    if (file.size > LIMITS.videoMaxBytes) return resolve(['Vídeo acima de 100 MB.', 0]);
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(el.src);
      if (el.duration > LIMITS.videoMaxSeconds + 0.5) {
        resolve([`Vídeo acima de ${LIMITS.videoMaxSeconds}s.`, 0]);
      } else {
        resolve([null, Math.round(el.duration)]);
      }
    };
    el.onerror = () => resolve(['Não consegui ler o vídeo.', 0]);
    el.src = URL.createObjectURL(file);
  });
}

const extOf = (file: File) => file.name.split('.').pop()?.toLowerCase() ?? 'bin';

/** Uploads a video to Storage, returns the path. Throws on error. */
export async function uploadVideo(userId: string, video: File): Promise<string> {
  const analysisId = crypto.randomUUID();
  const path = `${userId}/${analysisId}/video.${extOf(video)}`;
  const { error } = await supabase.storage
    .from('clips')
    .upload(path, video, { contentType: video.type, upsert: true });

  if (error) {
    if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
      throw new Error(
        'Bucket "clips" não encontrado. Vai ao Supabase → Storage → New bucket → chama-o "clips" → marca como público.',
      );
    }
    if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
      throw new Error(
        'Sem permissão para fazer upload. Corre o SQL de RLS no Supabase SQL Editor (ver instruções no ecrã).',
      );
    }
    throw new Error(`Falha no upload: ${error.message}`);
  }
  return path;
}

export interface AnalyzeOutcome {
  ok: boolean;
  error?: string;
  message?: string;      // human-readable message (e.g. gemini_overloaded)
  analysisId?: string;
  result?: AiResult;
}

/** Calls the edge function. It handles quota, runs Gemini, inserts the row, returns the result. */
export async function runAnalysis(params: {
  videoPath: string;
  tema?: string;
  duracao?: number;
  platform?: string;
}): Promise<AnalyzeOutcome> {
  const { data, error } = await supabase.functions.invoke('analyze-clip', {
    body: {
      video_path: params.videoPath,
      tema: params.tema || 'geral',
      duracao: params.duracao || 0,
      platform: params.platform || null,
    },
  });

  if (error) {
    const ctx = (error as { context?: Response }).context;
    const status = ctx?.status ?? 0;
    const msg = error.message ?? '';

    if (status === 404 || msg.includes('Failed to send') || msg.includes('relay') || msg.includes('not found')) {
      return {
        ok: false,
        error:
          'Edge Function não deployada — corre no terminal:\n  supabase functions deploy analyze-clip\n(ou Supabase → Edge Functions → Deploy)',
      };
    }

    if (ctx && typeof ctx.json === 'function') {
      try {
        const parsed = (await ctx.json()) as AnalyzeOutcome & { message?: string };
        if (parsed?.error === 'gemini_overloaded') {
          return { ok: false, error: 'gemini_overloaded', message: parsed.message };
        }
        if (parsed?.error) return { ok: false, error: parsed.error };
      } catch { /* fall through */ }
    }
    return { ok: false, error: `Falha: ${msg || 'erro desconhecido'}` };
  }

  // Also handle gemini_overloaded returned as a successful HTTP response
  const outcome = data as AnalyzeOutcome & { message?: string };
  if (outcome?.error === 'gemini_overloaded') {
    return { ok: false, error: 'gemini_overloaded', message: outcome.message };
  }
  return outcome;
}

export interface Quota {
  remaining: number | null;
  limit: number | null;
}

/** Client-side quota mirror. Counts completed analyses (all rows = completed). */
export async function getQuota(userId: string, plan: PlanTier): Promise<Quota> {
  if (plan === 'pro' || plan === 'elite') return { remaining: null, limit: null };

  let q = supabase
    .from('analyses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (plan === 'free') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    q = q.gte('created_at', startOfDay.toISOString());
  } else if (plan === 'starter') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    q = q.gte('created_at', startOfMonth.toISOString());
  }

  const { count } = await q;
  const limit = plan === 'starter' ? 10 : 1;
  return { remaining: Math.max(limit - (count ?? 0), 0), limit };
}

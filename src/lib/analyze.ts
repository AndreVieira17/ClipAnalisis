import { supabase } from '@/lib/supabase';
import type { AiResult, PlanTier } from '@/lib/analysis-types';

export const LIMITS = {
  videoMaxBytes:   100 * 1024 * 1024,
  videoMaxSeconds: 90,
  videoTypes:      ['video/mp4', 'video/quicktime', 'video/webm'],
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
  message?: string;
  analysisId?: string;
  result?: AiResult;
  next_reset_at?: string; // ISO — when the daily limit resets
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
      tema:       params.tema     || 'geral',
      duracao:    params.duracao  || 0,
      platform:   params.platform || null,
    },
  });

  if (error) {
    const ctx    = (error as { context?: Response }).context;
    const status = ctx?.status ?? 0;
    const msg    = error.message ?? '';

    if (status === 404 || msg.includes('Failed to send') || msg.includes('relay') || msg.includes('not found')) {
      return {
        ok: false,
        error: 'Edge Function não deployada — corre no terminal:\n  supabase functions deploy analyze-clip',
      };
    }

    if (ctx && typeof ctx.json === 'function') {
      try {
        const parsed = (await ctx.json()) as AnalyzeOutcome & { message?: string };
        // Propagate all known structured errors from the Edge Function
        if (parsed?.error) {
          return {
            ok:           false,
            error:        parsed.error,
            message:      parsed.message,
            next_reset_at: parsed.next_reset_at,
          };
        }
      } catch { /* fall through */ }
    }
    return { ok: false, error: `Falha: ${msg || 'erro desconhecido'}` };
  }

  const outcome = data as AnalyzeOutcome & { message?: string };

  // Normalise: Edge Function returns ok=false with error codes
  if (!outcome?.ok && outcome?.error) {
    return {
      ok:           false,
      error:        outcome.error,
      message:      outcome.message,
      next_reset_at: outcome.next_reset_at,
    };
  }

  return outcome;
}

export interface Quota {
  remaining:   number | null; // null = unlimited
  limit:       number | null;
  nextResetAt: Date | null;
  expired?:    boolean;       // true if paid subscription has lapsed
}

/** Client-side quota pre-check — reads subscriptions + profiles. Server is always authoritative. */
export async function getQuota(userId: string, plan: PlanTier): Promise<Quota> {
  if (plan === 'pro' || plan === 'elite') {
    // Unlimited — but check subscription expiry
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('subscription_end_date')
      .eq('user_id', userId)
      .maybeSingle();

    const endDate = sub?.subscription_end_date
      ? new Date(sub.subscription_end_date as string)
      : null;

    if (endDate && new Date() > endDate) {
      return { remaining: 0, limit: 0, nextResetAt: null, expired: true };
    }
    return { remaining: null, limit: null, nextResetAt: null };
  }

  if (plan === 'starter') {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('subscription_end_date, daily_analyses_used, last_daily_reset')
      .eq('user_id', userId)
      .maybeSingle();

    // Check expiry
    const endDate = sub?.subscription_end_date
      ? new Date(sub.subscription_end_date as string)
      : null;
    if (endDate && new Date() > endDate) {
      return { remaining: 0, limit: 0, nextResetAt: null, expired: true };
    }

    const today     = new Date().toDateString();
    const lastReset = sub?.last_daily_reset
      ? new Date(sub.last_daily_reset as string).toDateString()
      : null;
    const dailyUsed = (lastReset === today)
      ? ((sub?.daily_analyses_used as number) ?? 0)
      : 0;

    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    return {
      remaining:   Math.max(5 - dailyUsed, 0),
      limit:       5,
      nextResetAt: dailyUsed >= 5 ? tomorrow : null,
    };
  }

  // Free: 1 analysis per email address — forever, never resets
  const { data: profile } = await supabase
    .from('profiles')
    .select('last_analysis_at')
    .eq('id', userId)
    .single();

  const lastAt = profile?.last_analysis_at as string | null;
  const used = Boolean(lastAt);

  return {
    remaining:   used ? 0 : 1,
    limit:       1,
    nextResetAt: null,
  };
}

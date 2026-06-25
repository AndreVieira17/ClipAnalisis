// Edge Function: analyze-clip  (verify_jwt = true)
// Quota gate:
//   free    → 1/day  (resets at midnight UTC)
//   starter → 5/day  (resets at midnight UTC) + must have active subscription ≤ 30 days
//   pro     → unlimited + must have active subscription ≤ 30 days
//   elite   → unlimited + must have active subscription ≤ 30 days
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';
import { buildPromptForPlan, SYSTEM_RUBRIC } from '../_shared/rubric.ts';
import { analyzeVideo } from '../_shared/gemini.ts';
import { extractJson, isUsable, normalize } from '../_shared/schema.ts';
import { gateResult } from '../_shared/gating.ts';
import type { PlanTier } from '../_shared/types.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON        = Deno.env.get('SUPABASE_ANON_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  try {
    // ---- 1. Auth -----------------------------------------------------------
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ ok: false, error: 'unauthorized' }, 401);
    const userId = userData.user.id;

    // ---- 2. Input ----------------------------------------------------------
    const body = await req.json();
    const videoPath  = body.video_path  as string | undefined;
    const sourceUrl  = body.source_url  as string | undefined;
    const tema       = (body.tema       as string | undefined) ?? 'geral';
    const duracao    = (body.duracao    as number | undefined) ?? 0;
    const platform   = (body.platform   as string | undefined) ?? null;

    if (!videoPath && !sourceUrl) {
      return json({ ok: false, error: 'nothing_to_analyze' }, 400);
    }

    // ---- 3. Read plan from profiles (source of truth) ----------------------
    const { data: profile } = await admin
      .from('profiles')
      .select('plan, last_analysis_at')
      .eq('id', userId)
      .single();
    const plan = ((profile?.plan as string) ?? 'free') as PlanTier;

    // ---- 4. For paid plans: check subscription validity (30-day window) ----
    if (plan !== 'free') {
      const { data: sub } = await admin
        .from('subscriptions')
        .select('subscription_end_date, daily_analyses_used, last_daily_reset')
        .eq('user_id', userId)
        .maybeSingle();

      const endDate = sub?.subscription_end_date
        ? new Date(sub.subscription_end_date as string)
        : null;

      if (!endDate || new Date() > endDate) {
        // Expired — auto-downgrade plan in profiles so future requests also fail fast
        await admin.from('profiles').update({ plan: 'free' }).eq('id', userId);
        return json({
          ok: false,
          error: 'subscription_expired',
          message: 'O teu plano expirou. Renova para continuar a analisar.',
        }, 403);
      }

      // Starter: max 5 analyses per day
      if (plan === 'starter') {
        const todayStr = new Date().toDateString();
        const lastResetStr = sub?.last_daily_reset
          ? new Date(sub.last_daily_reset as string).toDateString()
          : null;
        const dailyUsed = (lastResetStr === todayStr)
          ? ((sub?.daily_analyses_used as number) ?? 0)
          : 0;

        if (dailyUsed >= 5) {
          const tomorrow = new Date();
          tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
          tomorrow.setUTCHours(0, 0, 0, 0);
          return json({
            ok: false,
            error: 'limit_starter_daily',
            message: 'Atingiste o limite de 5 análises diárias do plano Starter.',
            next_reset_at: tomorrow.toISOString(),
          }, 429);
        }
      }
      // pro / elite: no daily limit
    }

    // ---- 5. Free plan: 1 analysis per day (resets at midnight UTC) ---------
    if (plan === 'free') {
      const lastAt = profile?.last_analysis_at as string | null;
      if (lastAt) {
        const lastDate = new Date(lastAt);
        // Reset at UTC midnight
        const todayMidnightUTC = new Date();
        todayMidnightUTC.setUTCHours(0, 0, 0, 0);
        if (lastDate >= todayMidnightUTC) {
          const tomorrow = new Date(todayMidnightUTC);
          tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
          return json({
            ok: false,
            error: 'limit_free',
            next_reset_at: tomorrow.toISOString(),
          }, 429);
        }
      }
    }

    // ---- 6. Curated data for the tema ------------------------------------
    const { data: audios } = await admin
      .from('trending_audios')
      .select('title, artist, url, niche')
      .eq('active', true)
      .limit(20);
    const { data: resources } = await admin
      .from('resources')
      .select('kind, title, url, niche')
      .eq('active', true)
      .limit(20);

    const matchTema = <T extends { niche?: string | null }>(rows: T[] | null): T[] => {
      const list = rows ?? [];
      if (!tema || tema === 'geral') return list.slice(0, 8);
      const hit = list.filter((r) => (r.niche ?? '').toLowerCase() === tema.toLowerCase());
      return (hit.length ? hit : list).slice(0, 8);
    };

    // ---- 7. Get video stream from Storage ----------------------------------
    if (!videoPath) return json({ ok: false, error: 'no_video_available' }, 400);

    const { data: signedData, error: signErr } = await admin.storage
      .from('clips')
      .createSignedUrl(videoPath, 300);
    if (signErr || !signedData?.signedUrl) {
      throw new Error(`Failed to get signed URL: ${signErr?.message}`);
    }

    const vidFetch = await fetch(signedData.signedUrl);
    if (!vidFetch.ok) throw new Error(`Failed to fetch video (${vidFetch.status})`);

    const contentLength = parseInt(vidFetch.headers.get('Content-Length') ?? '0', 10);
    const mimeType = vidFetch.headers.get('Content-Type') || 'video/mp4';
    if (!vidFetch.body) throw new Error('Video response has no body stream');
    const videoStream = vidFetch.body;

    // ---- 8. Build plan-tiered prompt ---------------------------------------
    const promptOpts = {
      platform,
      niche: tema,
      hasMetrics: false,
      curatedAudios: matchTema(audios),
      curatedResources: matchTema(resources),
    };
    const prompt = `${SYSTEM_RUBRIC}\n\n${buildPromptForPlan(plan, promptOpts)}`;

    // ---- 9. Run Gemini (with retry on 503 / overload) ----------------------
    const isRetryable = (e: unknown): boolean => {
      const msg = String(e).toLowerCase();
      return msg.includes('503') || msg.includes('high demand') || msg.includes('overloaded') || msg.includes('service unavailable');
    };

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 10_000; // 10s — Gemini 503s need more breathing room
    let raw: string | undefined;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        let stream = videoStream;
        let length = contentLength;
        if (attempt > 1) {
          const reFetch = await fetch(signedData.signedUrl);
          if (!reFetch.ok || !reFetch.body) throw new Error('Re-fetch for retry failed');
          stream = reFetch.body;
          length = parseInt(reFetch.headers.get('Content-Length') ?? '0', 10) || contentLength;
        }
        raw = await analyzeVideo(stream, mimeType, length, prompt);
        break;
      } catch (e) {
        lastError = e;
        console.warn(`Gemini attempt ${attempt}/${MAX_RETRIES} failed:`, String(e).slice(0, 200));
        if (!isRetryable(e) || attempt === MAX_RETRIES) break;
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }

    if (!raw) {
      if (isRetryable(lastError)) {
        return json({
          ok: false,
          error: 'gemini_overloaded',
          message: 'A IA está com muita procura agora. O teu clip foi guardado e a análise será feita automaticamente em breve.',
        }, 503);
      }
      throw lastError ?? new Error('Gemini returned no response');
    }

    // ---- 10. Parse + quality check -----------------------------------------
    let result = normalize(extractJson(raw), false);
    if (!isUsable(result)) {
      try {
        const reFetch2 = await fetch(signedData.signedUrl);
        if (reFetch2.ok && reFetch2.body) {
          const len2 = parseInt(reFetch2.headers.get('Content-Length') ?? '0', 10) || contentLength;
          const raw2 = await analyzeVideo(reFetch2.body, mimeType, len2, prompt);
          result = normalize(extractJson(raw2), false);
        }
      } catch { /* use first result */ }
    }

    // ---- 11. Gate result by plan + insert row ------------------------------
    const gated = gateResult(result, plan);
    const analysisId = crypto.randomUUID();
    const now = new Date();

    const { error: insErr } = await admin.from('analyses').insert({
      id: analysisId,
      user_id: userId,
      plan,
      tema,
      duracao,
      form_data: {
        ai_result: gated,
        video_path: videoPath ?? null,
        source_url: sourceUrl ?? null,
        platform,
      },
    });

    if (insErr) {
      console.error('analyses insert error', insErr);
      return json({ ok: true, analysis_id: null, result: gated, warning: 'persist_failed' });
    }

    // ---- 12. Update tracking counters --------------------------------------
    // Always update profiles.last_analysis_at
    await admin
      .from('profiles')
      .update({ last_analysis_at: now.toISOString() })
      .eq('id', userId);

    // Starter: increment daily_analyses_used in subscriptions
    if (plan === 'starter') {
      const todayStr = now.toDateString();
      const { data: sub } = await admin
        .from('subscriptions')
        .select('daily_analyses_used, last_daily_reset')
        .eq('user_id', userId)
        .maybeSingle();

      const lastResetStr = sub?.last_daily_reset
        ? new Date(sub.last_daily_reset as string).toDateString()
        : null;
      const prevCount = (lastResetStr === todayStr) ? ((sub?.daily_analyses_used as number) ?? 0) : 0;

      await admin
        .from('subscriptions')
        .update({
          daily_analyses_used: prevCount + 1,
          last_daily_reset: now.toISOString(),
        })
        .eq('user_id', userId);
    }

    return json({ ok: true, analysis_id: analysisId, result: gated });
  } catch (err) {
    console.error('analyze-clip error', err);
    return json({ ok: false, error: 'analysis_failed', detail: String(err).slice(0, 500) }, 500);
  }
});

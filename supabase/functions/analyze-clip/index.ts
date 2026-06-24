// Edge Function: analyze-clip  (verify_jwt = true)
// Receives video_path (already in Storage), runs Gemini, inserts the completed row.
// The analyses table has ONLY: id, user_id, plan, tema, duracao, form_data, created_at
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';
import { SYSTEM_RUBRIC, buildUserPrompt } from '../_shared/rubric.ts';
import * as gemini from '../_shared/gemini.ts';
import { extractJson, isUsable, normalize } from '../_shared/schema.ts';
import { gateResult } from '../_shared/gating.ts';
import type { PlanTier } from '../_shared/types.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

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
    const videoPath = body.video_path as string | undefined;
    const sourceUrl = body.source_url as string | undefined;
    const tema = (body.tema as string | undefined) ?? 'geral';
    const duracao = (body.duracao as number | undefined) ?? 0;
    const platform = (body.platform as string | undefined) ?? null;

    if (!videoPath && !sourceUrl) {
      return json({ ok: false, error: 'nothing_to_analyze' }, 400);
    }

    // ---- 3. Get user plan from profiles ------------------------------------
    const { data: profile } = await admin
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();
    const plan = ((profile?.plan as string) ?? 'free') as PlanTier;

    // ---- 4. Quota gate (server-side, authoritative) -----------------------
    if (plan !== 'pro' && plan !== 'elite') {
      const now = new Date();
      let cutoff: string;
      let limit: number;

      if (plan === 'free') {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        cutoff = d.toISOString();
        limit = 1;
      } else {
        // starter — 10 per month
        const d = new Date(now);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        cutoff = d.toISOString();
        limit = 10;
      }

      const { count } = await admin
        .from('analyses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', cutoff);

      if ((count ?? 0) >= limit) {
        return json({ ok: false, error: 'limit_reached', plan }, 429);
      }
    }

    // ---- 5. Curated data for the tema ------------------------------------
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

    // ---- 6. Pull video from Storage ----------------------------------------
    let videoRef: gemini.FileRef | undefined;

    if (videoPath) {
      const { data: vidBlob, error: dlErr } = await admin.storage.from('clips').download(videoPath);
      if (dlErr || !vidBlob) throw new Error(`Falha ao descarregar vídeo do Storage: ${dlErr?.message}`);
      videoRef = await gemini.uploadVideo(vidBlob, vidBlob.type || 'video/mp4');
    }
    // Note: source_url (direct links) not supported — TikTok/Instagram block server fetches.
    // Users must download the video first and upload the file.

    if (!videoRef) return json({ ok: false, error: 'no_video_available' }, 400);

    // ---- 7. Run Gemini engine (with retry on 503 / high-demand) -------------
    const prompt = buildUserPrompt({
      platform,
      niche: tema,
      hasMetrics: false,
      curatedAudios: matchTema(audios),
      curatedResources: matchTema(resources),
    });

    const isRetryable = (e: unknown): boolean => {
      const msg = String(e).toLowerCase();
      return msg.includes('503') || msg.includes('high demand') || msg.includes('overloaded') || msg.includes('service unavailable');
    };

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 5000;

    let result: ReturnType<typeof normalize> | undefined;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const raw = await gemini.generateJson(SYSTEM_RUBRIC, { video: videoRef, metrics: undefined, prompt }, 0.4);
        result = normalize(extractJson(raw), false);
        if (!isUsable(result)) {
          // Quality retry at higher temperature — not a 503, so no sleep needed
          const raw2 = await gemini.generateJson(SYSTEM_RUBRIC, { video: videoRef, metrics: undefined, prompt }, 0.6);
          result = normalize(extractJson(raw2), false);
        }
        break; // success — exit retry loop
      } catch (e) {
        lastError = e;
        console.warn(`Gemini attempt ${attempt}/${MAX_RETRIES} failed:`, String(e).slice(0, 200));
        if (!isRetryable(e) || attempt === MAX_RETRIES) break;
        await sleep(RETRY_DELAY_MS);
      }
    }

    if (!result || !isUsable(result)) {
      if (videoRef) await gemini.deleteFile(videoRef.name).catch(() => {});
      if (isRetryable(lastError)) {
        return json({
          ok: false,
          error: 'gemini_overloaded',
          message: 'A IA está com muita procura agora. O teu clip foi guardado e a análise será feita automaticamente em breve. Não perdes a tua análise.',
        }, 503);
      }
      throw lastError ?? new Error('Gemini returned unusable result');
    }

    if (videoRef) await gemini.deleteFile(videoRef.name).catch(() => {});

    // ---- 8. Gate by plan, build form_data, insert row ----------------------
    const gated = gateResult(result, plan);

    const analysisId = crypto.randomUUID();
    const formData = {
      ai_result: gated,
      video_path: videoPath ?? null,
      source_url: sourceUrl ?? null,
      platform,
    };

    const { error: insErr } = await admin.from('analyses').insert({
      id: analysisId,
      user_id: userId,
      plan,
      tema,
      duracao,
      form_data: formData,
    });

    if (insErr) {
      console.error('analyses insert error', insErr);
      // Return the result even if we couldn't persist — client still gets the analysis
      return json({ ok: true, analysis_id: null, result: gated, warning: 'persist_failed' });
    }

    return json({ ok: true, analysis_id: analysisId, result: gated });
  } catch (err) {
    console.error('analyze-clip error', err);
    return json({ ok: false, error: 'analysis_failed', detail: String(err).slice(0, 500) }, 500);
  }
});

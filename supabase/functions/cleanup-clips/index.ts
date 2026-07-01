// Edge Function: cleanup-clips
// Deletes orphaned videos from the clips bucket.
// Run manually or via a scheduled trigger.
//
// Strategy:
//  1. Delete ALL video paths recorded in the analyses table (should already be gone
//     after the immediate-delete fix in analyze-clip, but catches anything older).
//  2. Scan the storage bucket recursively and delete any file older than 1 hour
//     that wasn't caught by step 1 (e.g. the analysis crashed before the DB insert).
//
// Authorization: optional CLEANUP_SECRET env var. If set, the caller must pass it
// as ?secret=<value> or Authorization: Bearer <value>. If not set, the function
// runs without auth (safe — it only cleans up storage files, never exposes data).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CLEANUP_SECRET  = Deno.env.get('CLEANUP_SECRET') ?? ''; // optional — leave empty to run without auth
const ONE_HOUR_MS     = 60 * 60 * 1000;

async function removeInBatches(
  admin: ReturnType<typeof createClient>,
  paths: string[],
): Promise<{ deleted: number; errors: number }> {
  let deleted = 0, errors = 0;
  for (let i = 0; i < paths.length; i += 100) {
    const batch = paths.slice(i, i + 100);
    const { error } = await admin.storage.from('clips').remove(batch);
    if (error) {
      console.error('remove batch error:', error.message);
      errors++;
    } else {
      deleted += batch.length;
    }
  }
  return { deleted, errors };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // If CLEANUP_SECRET is set, verify it — accept via Bearer header or ?secret= query param
  if (CLEANUP_SECRET) {
    const bearer = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const query  = new URL(req.url).searchParams.get('secret') ?? '';
    if (bearer !== CLEANUP_SECRET && query !== CLEANUP_SECRET) {
      return json({ ok: false, error: 'unauthorized' }, 401);
    }
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const cutoff = new Date(Date.now() - ONE_HOUR_MS).toISOString();

  let totalDeleted = 0;
  let totalErrors  = 0;

  // ── Step 1: delete all known video paths from analyses table ───────────────
  // These should have been cleaned immediately after analysis, but this catches
  // anything that slipped through before the fix was deployed.
  const { data: rows } = await admin
    .from('analyses')
    .select('form_data')
    .not('form_data', 'is', null);

  const knownPaths: string[] = [];
  for (const row of rows ?? []) {
    const vp = (row.form_data as Record<string, unknown>)?.video_path as string | null;
    if (vp) knownPaths.push(vp);
  }

  if (knownPaths.length > 0) {
    console.log(`Step 1: deleting ${knownPaths.length} known video paths from analyses table`);
    const r = await removeInBatches(admin, knownPaths);
    totalDeleted += r.deleted;
    totalErrors  += r.errors;
  }

  // ── Step 2: scan bucket for orphan files older than 1 hour ────────────────
  // Path structure: clips/{userId}/{analysisId}/video.{ext}
  // list() is not recursive, so we walk 3 levels.
  const orphans: string[] = [];

  const { data: level1 } = await admin.storage.from('clips').list('', { limit: 500, sortBy: { column: 'name', order: 'asc' } });

  for (const userFolder of level1 ?? []) {
    // Folders have no id; files have an id — top level should only be folders
    const { data: level2 } = await admin.storage
      .from('clips')
      .list(userFolder.name, { limit: 500, sortBy: { column: 'created_at', order: 'asc' } });

    for (const analysisFolder of level2 ?? []) {
      const prefix = `${userFolder.name}/${analysisFolder.name}`;

      if (analysisFolder.id) {
        // Direct file at level 2 (unexpected structure) — check age
        const createdAt = (analysisFolder.metadata as Record<string, unknown>)?.lastModified as string
          ?? analysisFolder.updated_at
          ?? '';
        if (createdAt && createdAt < cutoff) orphans.push(prefix);
        continue;
      }

      // It's a subfolder — list files inside
      const { data: level3 } = await admin.storage
        .from('clips')
        .list(prefix, { limit: 20 });

      for (const file of level3 ?? []) {
        if (!file.id) continue; // nested folder, skip
        const createdAt = (file.metadata as Record<string, unknown>)?.lastModified as string
          ?? file.updated_at
          ?? '';
        if (createdAt && createdAt < cutoff) {
          orphans.push(`${prefix}/${file.name}`);
        }
      }
    }
  }

  if (orphans.length > 0) {
    // Remove paths already deleted in step 1 to avoid double-counting errors
    const knownSet = new Set(knownPaths);
    const newOrphans = orphans.filter((p) => !knownSet.has(p));
    if (newOrphans.length > 0) {
      console.log(`Step 2: deleting ${newOrphans.length} orphan files from storage scan`);
      const r = await removeInBatches(admin, newOrphans);
      totalDeleted += r.deleted;
      totalErrors  += r.errors;
    }
  }

  console.log(`cleanup-clips done — deleted: ${totalDeleted}, errors: ${totalErrors}`);
  return json({ ok: true, deleted: totalDeleted, errors: totalErrors });
});

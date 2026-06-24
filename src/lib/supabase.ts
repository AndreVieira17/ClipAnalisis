import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Validate that the URL looks like a real Supabase project URL (not an accidental JWT)
const urlIsValid = Boolean(url && url.startsWith('https://') && url.includes('.supabase.co'));
const anonIsValid = Boolean(anon && anon.startsWith('eyJ'));

/** True only when both env vars are present and correctly formatted. */
export const supabaseReady = urlIsValid && anonIsValid;

/** Human-readable reason why the backend is not ready (used in error UI). */
export const supabaseNotReadyReason: string | null = supabaseReady
  ? null
  : !url
  ? 'VITE_SUPABASE_URL não está definida no .env.local'
  : !urlIsValid
  ? `VITE_SUPABASE_URL tem valor inválido — deve ser https://xxxx.supabase.co (não um JWT). Valor actual: "${url.slice(0, 40)}…"`
  : !anon
  ? 'VITE_SUPABASE_ANON_KEY não está definida no .env.local'
  : 'VITE_SUPABASE_ANON_KEY tem valor inválido — deve ser um JWT que começa com "eyJ"';

if (!supabaseReady && import.meta.env.DEV) {
  console.warn('[ClipAnalisis] Backend não configurado:', supabaseNotReadyReason);
}

// A harmless placeholder client keeps the marketing site building/running even
// before the backend is configured; the analyzer checks `supabaseReady` first.
export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anon ?? 'placeholder-anon-key',
);

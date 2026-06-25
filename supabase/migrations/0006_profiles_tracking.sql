-- ============================================================================
-- ClipAnalisis — tracking fields on profiles
-- last_analysis_at: used for Free plan 24h countdown timer
-- clips_this_month / month_year: used for Starter monthly counter
-- ============================================================================

alter table public.profiles
  add column if not exists last_analysis_at  timestamptz,
  add column if not exists full_name          text,
  add column if not exists clips_this_month  integer not null default 0,
  add column if not exists month_year        text;   -- format: 'YYYY-MM'

-- RLS: owner can read own profile (already enabled)
-- Service-role writes last_analysis_at after each analysis (Edge Function)

-- Policy: authenticated users read their own profile
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

-- Policy: authenticated users update their own full_name only
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================================
-- XZK clip-analysis — core schema
-- Plans: free / starter / pro / elite  (gating enforced server-side only)
-- ============================================================================

-- ---- plan enum -------------------------------------------------------------
do $$ begin
  create type plan_tier as enum ('free', 'starter', 'pro', 'elite');
exception when duplicate_object then null; end $$;

do $$ begin
  create type analysis_status as enum ('pending', 'processing', 'done', 'error');
exception when duplicate_object then null; end $$;

-- ---- profiles --------------------------------------------------------------
-- One row per auth user. `plan` is the single source of truth for gating.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  plan        plan_tier not null default 'free',
  created_at  timestamptz not null default now()
);

-- create a profile automatically for every new auth user (default plan = free)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, plan)
  values (new.id, new.email, 'free')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- analyses --------------------------------------------------------------
create table if not exists public.analyses (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  plan                plan_tier not null default 'free',
  platform            text,                 -- tiktok | reels | shorts | ...
  niche               text,                 -- free-text niche/theme
  video_path          text,                 -- storage path in clip-videos
  metrics_image_path  text,                 -- storage path in clip-metrics
  ai_result           jsonb,                -- validated engine output
  error_message       text,
  status              analysis_status not null default 'pending',
  created_at          timestamptz not null default now()
);

create index if not exists analyses_user_idx on public.analyses(user_id, created_at desc);

-- ---- curated tables (read: authenticated, write: service_role) --------------
create table if not exists public.trending_audios (
  id         uuid primary key default gen_random_uuid(),
  niche      text not null,
  platform   text not null,
  title      text not null,
  artist     text,
  url        text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.resources (
  id         uuid primary key default gen_random_uuid(),
  topic      text not null,
  kind       text not null check (kind in ('tutorial', 'fonte', 'template')),
  title      text not null,
  url        text,
  niche      text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---- clip tracking (evolution over time) -----------------------------------
create table if not exists public.clip_tracking (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  analysis_id  uuid not null references public.analyses(id) on delete cascade,
  score        integer,              -- viral_readiness 0-100
  views        bigint,
  retention    numeric,              -- average retention % if known
  niche        text,
  recorded_at  timestamptz not null default now()
);

create index if not exists clip_tracking_user_idx on public.clip_tracking(user_id, recorded_at desc);

-- ============================================================================
-- record_analysis(): the ONLY place plan limits are enforced.
--   free    -> 1 analysis per account (lifetime)
--   starter -> 5 analyses per day
--   pro     -> unlimited
--   elite   -> unlimited
-- Counts analyses that actually consumed compute (processing|done), excluding
-- the current pending row. Returns { ok, plan, remaining?, error? }.
-- ============================================================================
create or replace function public.record_analysis(p_analysis_id uuid)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_user   uuid;
  v_plan   plan_tier;
  v_used   integer;
  v_limit  integer;
begin
  -- resolve the owner of this analysis row
  select user_id into v_user from public.analyses where id = p_analysis_id;
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'analysis_not_found');
  end if;

  -- gating ALWAYS reads the plan from the DB, never from the client
  select plan into v_plan from public.profiles where id = v_user;
  if v_plan is null then v_plan := 'free'; end if;

  if v_plan = 'free' then
    select count(*) into v_used
    from public.analyses
    where user_id = v_user
      and id <> p_analysis_id
      and status in ('processing', 'done');
    v_limit := 1;
    if v_used >= v_limit then
      return jsonb_build_object('ok', false, 'error', 'limit_reached', 'plan', v_plan);
    end if;

  elsif v_plan = 'starter' then
    select count(*) into v_used
    from public.analyses
    where user_id = v_user
      and id <> p_analysis_id
      and status in ('processing', 'done')
      and created_at >= date_trunc('day', now());
    v_limit := 5;
    if v_used >= v_limit then
      return jsonb_build_object('ok', false, 'error', 'limit_reached', 'plan', v_plan);
    end if;
  end if;
  -- pro / elite: unlimited

  return jsonb_build_object(
    'ok', true,
    'plan', v_plan,
    'remaining', case when v_limit is null then null else greatest(v_limit - v_used, 0) end
  );
end;
$$;

revoke all on function public.record_analysis(uuid) from public;
grant execute on function public.record_analysis(uuid) to authenticated, service_role;

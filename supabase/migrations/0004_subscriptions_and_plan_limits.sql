-- ============================================================================
-- ClipAnalisis — subscriptions table + updated plan limits
-- Plans (EUR): free=0€/1 per day | starter=9.99€/10 per month | pro=24.99€/∞ | elite=39.99€/∞
-- ============================================================================

-- ---- subscriptions table ---------------------------------------------------
-- Mirrors the Stripe subscription for each paid user. Written by the
-- stripe-webhook Edge Function (service_role). Never written by the client.
create table if not exists public.subscriptions (
  id                    text primary key,   -- Stripe subscription ID
  user_id               uuid not null references auth.users(id) on delete cascade,
  plan                  plan_tier not null default 'free',
  price_id              text,               -- Stripe Price ID
  stripe_customer_id    text,
  status                text not null,      -- active | past_due | canceled | ...
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions(user_id);

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---- RLS for subscriptions ------------------------------------------------
alter table public.subscriptions enable row level security;

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select using (auth.uid() = user_id);

-- ============================================================================
-- Updated record_analysis(): new plan limits
--   free    → 1 analysis / day (reset at midnight UTC)
--   starter → 10 analyses / month (calendar month)
--   pro     → unlimited
--   elite   → unlimited
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
  select user_id into v_user from public.analyses where id = p_analysis_id;
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'analysis_not_found');
  end if;

  select plan into v_plan from public.profiles where id = v_user;
  if v_plan is null then v_plan := 'free'; end if;

  if v_plan = 'free' then
    -- 1 per day (UTC)
    select count(*) into v_used
    from public.analyses
    where user_id = v_user
      and id <> p_analysis_id
      and status in ('processing', 'done')
      and created_at >= date_trunc('day', now() at time zone 'utc');
    v_limit := 1;
    if v_used >= v_limit then
      return jsonb_build_object('ok', false, 'error', 'limit_reached', 'plan', v_plan, 'resets_at', date_trunc('day', now() at time zone 'utc') + interval '1 day');
    end if;

  elsif v_plan = 'starter' then
    -- 10 per calendar month
    select count(*) into v_used
    from public.analyses
    where user_id = v_user
      and id <> p_analysis_id
      and status in ('processing', 'done')
      and created_at >= date_trunc('month', now() at time zone 'utc');
    v_limit := 10;
    if v_used >= v_limit then
      return jsonb_build_object('ok', false, 'error', 'limit_reached', 'plan', v_plan, 'resets_at', date_trunc('month', now() at time zone 'utc') + interval '1 month');
    end if;
  end if;
  -- pro / elite: unlimited

  return jsonb_build_object(
    'ok', true,
    'plan', v_plan,
    'remaining', case when v_limit is null then null else greatest(v_limit - v_used - 1, 0) end
  );
end;
$$;

revoke all on function public.record_analysis(uuid) from public;
grant execute on function public.record_analysis(uuid) to authenticated, service_role;

-- ============================================================================
-- Row Level Security + private storage buckets
-- ============================================================================

alter table public.profiles        enable row level security;
alter table public.analyses        enable row level security;
alter table public.trending_audios enable row level security;
alter table public.resources       enable row level security;
alter table public.clip_tracking   enable row level security;

-- ---- profiles: owner read; owner may update non-sensitive cols -------------
-- NOTE: `plan` must NOT be user-writable (gating integrity). We allow update
-- but block plan changes via a trigger below.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- prevent clients from upgrading their own plan
create or replace function public.guard_plan_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.plan is distinct from old.plan then
    -- only service_role (Stripe webhook / admin) may change the plan
    if current_setting('request.jwt.claim.role', true) is distinct from 'service_role'
       and auth.role() is distinct from 'service_role' then
      new.plan := old.plan;
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists profiles_guard_plan on public.profiles;
create trigger profiles_guard_plan
  before update on public.profiles
  for each row execute function public.guard_plan_change();

-- ---- analyses: owner full access; service_role writes results --------------
drop policy if exists analyses_select_own on public.analyses;
create policy analyses_select_own on public.analyses
  for select using (auth.uid() = user_id);

drop policy if exists analyses_insert_own on public.analyses;
create policy analyses_insert_own on public.analyses
  for insert with check (auth.uid() = user_id);

drop policy if exists analyses_update_own on public.analyses;
create policy analyses_update_own on public.analyses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- curated tables: read for authenticated; writes only service_role ------
drop policy if exists trending_read on public.trending_audios;
create policy trending_read on public.trending_audios
  for select to authenticated using (active = true);

drop policy if exists resources_read on public.resources;
create policy resources_read on public.resources
  for select to authenticated using (active = true);

-- ---- clip_tracking: owner read; inserts come from service_role -------------
drop policy if exists tracking_select_own on public.clip_tracking;
create policy tracking_select_own on public.clip_tracking
  for select using (auth.uid() = user_id);

-- ============================================================================
-- Storage buckets — private, RLS scoped to the first path segment = auth.uid()
--   path convention:  ${user_id}/${analysis_id}/${filename}
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('clip-videos',  'clip-videos',  false, 104857600,
     array['video/mp4','video/quicktime','video/webm']),
  ('clip-metrics', 'clip-metrics', false, 10485760,
     array['image/png','image/jpeg','image/webp'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- helper: object's owning user = first folder segment
drop policy if exists clip_videos_rw on storage.objects;
create policy clip_videos_rw on storage.objects
  for all to authenticated
  using (bucket_id = 'clip-videos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'clip-videos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists clip_metrics_rw on storage.objects;
create policy clip_metrics_rw on storage.objects
  for all to authenticated
  using (bucket_id = 'clip-metrics' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'clip-metrics' and (storage.foldername(name))[1] = auth.uid()::text);

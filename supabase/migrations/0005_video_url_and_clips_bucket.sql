-- ============================================================================
-- ClipAnalisis — add video_url column + clips storage bucket
-- video_url: direct link from TikTok / Instagram / YouTube Shorts
-- clips bucket: replaces clip-videos (simpler, single bucket for all media)
-- ============================================================================

-- Add video_url column to analyses (nullable — either video_path or video_url)
alter table public.analyses
  add column if not exists video_url text;

-- Create the new unified clips bucket (public, 100MB video limit)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'clips', 'clips', true, 104857600,
  array['video/mp4','video/quicktime','video/webm','image/png','image/jpeg','image/webp']
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types,
      public = excluded.public;

-- RLS: path convention ${user_id}/${analysis_id}/filename
drop policy if exists clips_rw on storage.objects;
create policy clips_rw on storage.objects
  for all to authenticated
  using (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'clips' and (storage.foldername(name))[1] = auth.uid()::text);

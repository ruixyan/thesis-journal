-- Adds image support. Run once in Supabase → SQL Editor (after schema.sql).

-- 1. Entries can hold images, and there's a new "image" entry type
alter table public.entries add column if not exists images text[] not null default '{}';

alter table public.entries drop constraint if exists entries_kind_check;
alter table public.entries add constraint entries_kind_check
  check (kind in ('idea', 'note', 'reference', 'reflection', 'todo', 'image'));

-- 2. Private storage bucket (files live under <your user id>/...)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('entry-images', 'entry-images', false, 10485760,
        array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'])
on conflict (id) do nothing;

-- 3. Only you can see, add or delete your own images
drop policy if exists "own entry images read" on storage.objects;
create policy "own entry images read" on storage.objects for select to authenticated
  using (bucket_id = 'entry-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "own entry images insert" on storage.objects;
create policy "own entry images insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'entry-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "own entry images delete" on storage.objects;
create policy "own entry images delete" on storage.objects for delete to authenticated
  using (bucket_id = 'entry-images' and (storage.foldername(name))[1] = auth.uid()::text);

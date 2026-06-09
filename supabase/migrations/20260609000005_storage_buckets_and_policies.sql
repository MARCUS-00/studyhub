-- Provision the storage buckets used by the app UI.
-- Notes and avatars are uploaded from the browser, so the buckets must exist
-- and allow authenticated inserts/updates. Public buckets are required for
-- getPublicUrl() to resolve note PDFs and profile images correctly.

insert into storage.buckets (id, name, public)
values
  ('notes', 'notes', true),
  ('avatars', 'avatars', true)
on conflict (id) do update
set public = excluded.public,
    name = excluded.name;

drop policy if exists "authenticated upload notes" on storage.objects;
drop policy if exists "authenticated update notes" on storage.objects;
drop policy if exists "authenticated upload avatars" on storage.objects;
drop policy if exists "authenticated update avatars" on storage.objects;
drop policy if exists "public read notes objects" on storage.objects;
drop policy if exists "public read avatars objects" on storage.objects;
drop policy if exists "anon and authenticated upload notes" on storage.objects;
drop policy if exists "anon and authenticated update notes" on storage.objects;
drop policy if exists "anon and authenticated upload avatars" on storage.objects;
drop policy if exists "anon and authenticated update avatars" on storage.objects;

create policy "anon and authenticated upload notes"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'notes');

create policy "anon and authenticated update notes"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'notes')
with check (bucket_id = 'notes');

create policy "anon and authenticated upload avatars"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'avatars');

create policy "anon and authenticated update avatars"
on storage.objects
for update
to anon, authenticated
using (bucket_id = 'avatars')
with check (bucket_id = 'avatars');

create policy "public read notes objects"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'notes');

create policy "public read avatars objects"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'avatars');
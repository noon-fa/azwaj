insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values
  ('brother-photos','brother-photos',false,5242880,array['image/jpeg','image/png','image/webp']),
  ('scholar-photos','scholar-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

create policy brother_photos_insert on storage.objects for insert to authenticated
with check (bucket_id='brother-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy brother_photos_manage on storage.objects for update to authenticated
using (bucket_id='brother-photos' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='brother-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy brother_photos_delete on storage.objects for delete to authenticated
using (bucket_id='brother-photos' and (storage.foldername(name))[1]=auth.uid()::text);

create policy brother_photos_signed_read on storage.objects for select to authenticated
using (
  bucket_id='brother-photos'
  and (
    (storage.foldername(name))[1]=auth.uid()::text
    or public.is_admin()
  )
);

create policy scholar_photos_staff on storage.objects for all to authenticated
using (bucket_id='scholar-photos' and (public.is_admin() or public.is_staff()))
with check (bucket_id='scholar-photos' and (public.is_admin() or public.is_staff()));

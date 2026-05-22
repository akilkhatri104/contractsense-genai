drop policy if exists "Users can read their own document objects" on storage.objects;
create policy "Users can read their own document objects"
  on storage.objects
  for select
  using (
    bucket_id = 'documents'
    and nullif((select auth.jwt()->>'sub'), '') is not null
    and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
  );

drop policy if exists "Users can upload their own document objects" on storage.objects;
create policy "Users can upload their own document objects"
  on storage.objects
  for insert
  with check (
    bucket_id = 'documents'
    and nullif((select auth.jwt()->>'sub'), '') is not null
    and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
  );

drop policy if exists "Users can update their own document objects" on storage.objects;
create policy "Users can update their own document objects"
  on storage.objects
  for update
  using (
    bucket_id = 'documents'
    and nullif((select auth.jwt()->>'sub'), '') is not null
    and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
  )
  with check (
    bucket_id = 'documents'
    and nullif((select auth.jwt()->>'sub'), '') is not null
    and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
  );

drop policy if exists "Users can delete their own document objects" on storage.objects;
create policy "Users can delete their own document objects"
  on storage.objects
  for delete
  using (
    bucket_id = 'documents'
    and nullif((select auth.jwt()->>'sub'), '') is not null
    and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
  );

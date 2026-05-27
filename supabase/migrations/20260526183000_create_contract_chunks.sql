create extension if not exists vector;

create table if not exists public.contract_chunks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt()->>'sub'),
  contract_id uuid not null references public.contracts (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create index if not exists contract_chunks_contract_id_idx
  on public.contract_chunks (contract_id);

create index if not exists contract_chunks_document_id_idx
  on public.contract_chunks (document_id);

create index if not exists contract_chunks_user_id_created_at_idx
  on public.contract_chunks (user_id, created_at desc);

create index if not exists contract_chunks_embedding_idx
  on public.contract_chunks using ivfflat (embedding vector_cosine_ops);

alter table public.contract_chunks enable row level security;

grant select, insert, update, delete on public.contract_chunks to authenticated;

drop policy if exists "Users can view their own contract chunks" on public.contract_chunks;
create policy "Users can view their own contract chunks"
  on public.contract_chunks
  for select
  to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "Users can insert their own contract chunks" on public.contract_chunks;
create policy "Users can insert their own contract chunks"
  on public.contract_chunks
  for insert
  to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "Users can update their own contract chunks" on public.contract_chunks;
create policy "Users can update their own contract chunks"
  on public.contract_chunks
  for update
  to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "Users can delete their own contract chunks" on public.contract_chunks;
create policy "Users can delete their own contract chunks"
  on public.contract_chunks
  for delete
  to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

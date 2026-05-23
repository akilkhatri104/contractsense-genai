create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default (auth.jwt()->>'sub'),
  document_id uuid not null unique references public.documents (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  status text not null default 'processing'
    check (status in ('processing', 'completed', 'failed')),
  current_stage text not null default 'uploaded'
    check (
      current_stage in (
        'uploaded',
        'parsing',
        'segmenting',
        'analyzing',
        'summarizing',
        'completed',
        'failed'
      )
    ),
  raw_text text,
  overall_summary text,
  clauses jsonb not null default '[]'::jsonb,
  high_risk_count integer not null default 0,
  medium_risk_count integer not null default 0,
  low_risk_count integer not null default 0,
  error_message text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contracts_user_id_created_at_idx
  on public.contracts (user_id, created_at desc);

create unique index if not exists contracts_document_id_idx
  on public.contracts (document_id);

alter table public.contracts enable row level security;

grant select, insert, update, delete on public.contracts to authenticated;

drop policy if exists "Users can view their own contracts" on public.contracts;
create policy "Users can view their own contracts"
  on public.contracts
  for select
  to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "Users can insert their own contracts" on public.contracts;
create policy "Users can insert their own contracts"
  on public.contracts
  for insert
  to authenticated
  with check ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "Users can update their own contracts" on public.contracts;
create policy "Users can update their own contracts"
  on public.contracts
  for update
  to authenticated
  using ((select auth.jwt()->>'sub') = user_id)
  with check ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "Users can delete their own contracts" on public.contracts;
create policy "Users can delete their own contracts"
  on public.contracts
  for delete
  to authenticated
  using ((select auth.jwt()->>'sub') = user_id);

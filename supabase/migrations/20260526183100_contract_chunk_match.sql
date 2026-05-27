create or replace function public.match_contract_chunks(
  p_user_id text,
  p_contract_id uuid,
  p_query_embedding vector(768),
  p_match_count integer default 6
)
returns table (
  id uuid,
  content text,
  chunk_index integer,
  similarity float
)
language sql
stable
as $$
  select
    contract_chunks.id,
    contract_chunks.content,
    contract_chunks.chunk_index,
    1 - (contract_chunks.embedding <=> p_query_embedding) as similarity
  from public.contract_chunks
  where contract_chunks.user_id = p_user_id
    and contract_chunks.contract_id = p_contract_id
    and contract_chunks.embedding is not null
  order by contract_chunks.embedding <=> p_query_embedding
  limit p_match_count;
$$;

grant execute on function public.match_contract_chunks(text, uuid, vector, integer) to authenticated;

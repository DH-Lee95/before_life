create table if not exists public.api_rate_limits (
  bucket_hash text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now()
);

alter table public.api_rate_limits enable row level security;
revoke all on table public.api_rate_limits from anon, authenticated;

create or replace function public.consume_api_rate_limit(
  p_bucket_hash text,
  p_limit integer,
  p_window_seconds integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_row public.api_rate_limits%rowtype;
  v_retry_after integer;
begin
  if length(p_bucket_hash) <> 64 or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit input';
  end if;

  insert into public.api_rate_limits(bucket_hash, window_started_at, request_count, updated_at)
  values (p_bucket_hash, v_now, 1, v_now)
  on conflict (bucket_hash) do update set
    window_started_at = case
      when api_rate_limits.window_started_at <= v_now - make_interval(secs => p_window_seconds) then v_now
      else api_rate_limits.window_started_at
    end,
    request_count = case
      when api_rate_limits.window_started_at <= v_now - make_interval(secs => p_window_seconds) then 1
      else api_rate_limits.request_count + 1
    end,
    updated_at = v_now
  returning * into v_row;

  v_retry_after := greatest(0, ceil(extract(epoch from (
    v_row.window_started_at + make_interval(secs => p_window_seconds) - v_now
  )))::integer);

  return jsonb_build_object(
    'allowed', v_row.request_count <= p_limit,
    'retry_after_seconds', case when v_row.request_count <= p_limit then 0 else v_retry_after end
  );
end;
$$;

revoke all on function public.consume_api_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, integer, integer) to service_role;

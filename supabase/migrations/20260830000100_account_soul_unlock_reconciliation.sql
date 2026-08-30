-- Reconcile environments where migration 20260828000400 was recorded before
-- its final account-entitlement schema existed. Every statement is idempotent.
create table if not exists public.soul_content_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  soul_profile_id text not null references public.soul_profiles(id) on delete cascade,
  content_type text not null,
  soul_content_id uuid not null references public.soul_contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, soul_profile_id, content_type)
);

create index if not exists soul_content_unlocks_user_id_idx
  on public.soul_content_unlocks(user_id);

alter table public.soul_content_unlocks enable row level security;
revoke all on table public.soul_content_unlocks from anon, authenticated;

create or replace function public.unlock_soul_content(
  p_user_id uuid,
  p_profile_id text,
  p_content_type text,
  p_generation_key text,
  p_cost integer
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_content public.soul_contents%rowtype;
  v_debit_session_id uuid;
  v_balance integer;
begin
  if p_cost not in (1, 2) then raise exception 'invalid soul cost'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  if not exists (
    select 1 from public.soul_profile_access
    where soul_profile_id = p_profile_id and user_id = p_user_id
  ) then raise exception 'profile access denied'; end if;

  select * into v_content from public.soul_contents
  where soul_profile_id = p_profile_id
    and content_type = p_content_type
    and generation_key = p_generation_key
  for update;
  if not found then raise exception 'soul content not found'; end if;

  select coalesce(sum(l.change_amount), 0)::integer into v_balance
  from public.soul_ledger l
  join public.anonymous_sessions s on s.id = l.anonymous_session_id
  where s.user_id = p_user_id;

  if exists (
    select 1 from public.soul_content_unlocks
    where user_id = p_user_id and soul_profile_id = p_profile_id and content_type = p_content_type
  ) then
    return jsonb_build_object('balance', v_balance, 'charged', false);
  end if;
  if v_balance < p_cost then raise exception 'insufficient soul balance'; end if;

  select id into v_debit_session_id from public.anonymous_sessions
  where user_id = p_user_id order by created_at, id limit 1;
  if v_debit_session_id is null then raise exception 'account session not found'; end if;

  insert into public.soul_ledger (anonymous_session_id, change_amount, reason, reference_id)
  values (v_debit_session_id, -p_cost, 'content_unlock', v_content.id)
  on conflict (anonymous_session_id, reason, reference_id) do nothing;

  insert into public.soul_content_unlocks (user_id, soul_profile_id, content_type, soul_content_id)
  values (p_user_id, p_profile_id, p_content_type, v_content.id)
  on conflict (user_id, soul_profile_id, content_type) do nothing;

  return jsonb_build_object('balance', v_balance - p_cost, 'charged', true);
end; $$;

revoke all on function public.unlock_soul_content(uuid, text, text, text, integer) from public, anon, authenticated;
grant execute on function public.unlock_soul_content(uuid, text, text, text, integer) to service_role;

create or replace function public.get_user_unlocked_soul_contents(
  p_user_id uuid,
  p_profile_id text
) returns table (
  soul_profile_id text,
  content_type text,
  generation_key text,
  content jsonb,
  created_at timestamptz
) language sql security definer set search_path = public stable as $$
  select c.soul_profile_id, c.content_type, c.generation_key, c.content, c.created_at
  from public.soul_contents c
  join public.soul_content_unlocks u on u.soul_content_id = c.id
  where u.user_id = p_user_id
    and u.soul_profile_id = p_profile_id
    and c.soul_profile_id = p_profile_id
    and u.content_type = c.content_type
    and exists (
      select 1 from public.soul_profile_access a
      where a.soul_profile_id = p_profile_id and a.user_id = p_user_id
    )
  order by u.created_at, c.id;
$$;

revoke all on function public.get_user_unlocked_soul_contents(uuid, text) from public, anon, authenticated;
grant execute on function public.get_user_unlocked_soul_contents(uuid, text) to service_role;

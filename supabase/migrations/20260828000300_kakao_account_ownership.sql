alter table public.anonymous_sessions
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists anonymous_sessions_user_id_idx
  on public.anonymous_sessions(user_id) where user_id is not null;

alter table public.soul_profile_access
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.soul_profile_access drop constraint if exists soul_profile_access_one_credential;
alter table public.soul_profile_access add constraint soul_profile_access_one_credential check (
  num_nonnulls(anonymous_session_id, result_token_hash, user_id) = 1
);
alter table public.soul_profile_access drop constraint if exists soul_profile_access_credential_unique;
alter table public.soul_profile_access add constraint soul_profile_access_credential_unique
  unique nulls not distinct (soul_profile_id, anonymous_session_id, result_token_hash, user_id);

create or replace function public.claim_anonymous_session(p_session_id text, p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_session_id uuid;
begin
  insert into public.anonymous_sessions(session_id, user_id)
  values (p_session_id, p_user_id)
  on conflict (session_id) do update
    set user_id = excluded.user_id
    where anonymous_sessions.user_id is null or anonymous_sessions.user_id = excluded.user_id
  returning id into v_session_id;

  if v_session_id is null then raise exception 'anonymous session belongs to another user'; end if;

  insert into public.soul_profile_access(soul_profile_id, user_id)
  select soul_profile_id, p_user_id from public.soul_profile_access
  where anonymous_session_id = v_session_id
  on conflict on constraint soul_profile_access_credential_unique do nothing;

  return jsonb_build_object('claimed', true);
end; $$;

create or replace function public.is_anonymous_session_owner(p_session_id text, p_user_id uuid)
returns jsonb language sql security definer set search_path = public stable as $$
  select jsonb_build_object('owned', exists(
    select 1 from public.anonymous_sessions where session_id = p_session_id and user_id = p_user_id
  ));
$$;

create or replace function public.get_user_soul_balance(p_user_id uuid)
returns jsonb language sql security definer set search_path = public stable as $$
  select jsonb_build_object('balance', coalesce(sum(l.change_amount), 0)::integer)
  from public.soul_ledger l
  join public.anonymous_sessions s on s.id = l.anonymous_session_id
  where s.user_id = p_user_id;
$$;

create or replace function public.approve_soul_purchase(
  p_payment_intent_id uuid, p_provider_payment_key text, p_raw_payload jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_intent public.payment_intents%rowtype;
  v_user_id uuid;
  v_balance integer;
begin
  select * into v_intent from public.payment_intents where id = p_payment_intent_id for update;
  if not found then raise exception 'payment intent not found'; end if;

  select user_id into v_user_id from public.anonymous_sessions where id = v_intent.anonymous_session_id;
  if v_user_id is null then raise exception 'authenticated account required'; end if;

  if v_intent.status = 'approved' then
    if v_intent.provider_payment_key is distinct from p_provider_payment_key then raise exception 'payment key mismatch'; end if;
  elsif v_intent.status = 'pending' then
    update public.payment_intents set status = 'approved', provider_payment_key = p_provider_payment_key, approved_at = now()
    where id = v_intent.id;
    insert into public.payment_transactions (
      anonymous_session_id, payment_intent_id, provider, provider_payment_key, order_id, amount_krw, souls, payment_status, raw_payload
    ) values (
      v_intent.anonymous_session_id, v_intent.id, 'toss', p_provider_payment_key, v_intent.order_id,
      v_intent.amount_krw, v_intent.souls, 'DONE', p_raw_payload
    ) on conflict (payment_intent_id) do nothing;
    insert into public.soul_ledger(anonymous_session_id, change_amount, reason, reference_id)
    values (v_intent.anonymous_session_id, v_intent.souls, 'purchase', v_intent.id)
    on conflict (anonymous_session_id, reason, reference_id) do nothing;
  else
    raise exception 'payment intent is not pending';
  end if;

  select coalesce(sum(l.change_amount), 0)::integer into v_balance
  from public.soul_ledger l join public.anonymous_sessions s on s.id = l.anonymous_session_id
  where s.user_id = v_user_id;
  return jsonb_build_object('balance', v_balance);
end; $$;

revoke all on function public.claim_anonymous_session(text, uuid) from public, anon, authenticated;
revoke all on function public.is_anonymous_session_owner(text, uuid) from public, anon, authenticated;
revoke all on function public.get_user_soul_balance(uuid) from public, anon, authenticated;
grant execute on function public.claim_anonymous_session(text, uuid) to service_role;
grant execute on function public.is_anonymous_session_owner(text, uuid) to service_role;
grant execute on function public.get_user_soul_balance(uuid) to service_role;

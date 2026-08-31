create or replace function public.cancel_soul_purchase(
  p_payment_intent_id uuid,
  p_provider_payment_key text,
  p_raw_payload jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_intent public.payment_intents%rowtype;
  v_user_id uuid;
  v_balance integer;
begin
  select * into v_intent
  from public.payment_intents
  where id = p_payment_intent_id
  for update;

  if not found then raise exception 'payment intent not found'; end if;
  if v_intent.provider_payment_key is distinct from p_provider_payment_key then
    raise exception 'payment key mismatch';
  end if;

  select user_id into v_user_id
  from public.anonymous_sessions
  where id = v_intent.anonymous_session_id;
  if v_user_id is null then raise exception 'authenticated account required'; end if;

  if v_intent.status = 'approved' then
    update public.payment_intents set status = 'canceled' where id = v_intent.id;
    update public.payment_transactions
    set payment_status = 'CANCELED', raw_payload = p_raw_payload
    where payment_intent_id = v_intent.id;
    insert into public.soul_ledger(anonymous_session_id, change_amount, reason, reference_id)
    values (v_intent.anonymous_session_id, -v_intent.souls, 'refund', v_intent.id)
    on conflict (anonymous_session_id, reason, reference_id) do nothing;
  elsif v_intent.status <> 'canceled' then
    raise exception 'payment intent is not approved';
  end if;

  select coalesce(sum(l.change_amount), 0)::integer into v_balance
  from public.soul_ledger l
  join public.anonymous_sessions s on s.id = l.anonymous_session_id
  where s.user_id = v_user_id;

  return jsonb_build_object('balance', v_balance);
end;
$$;

revoke all on function public.cancel_soul_purchase(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.cancel_soul_purchase(uuid, text, jsonb) to service_role;

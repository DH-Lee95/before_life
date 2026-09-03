alter table public.payment_intents
  add column if not exists provider_checkout_url text;

alter table public.payment_intents
  alter column provider set default 'payapp';

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
    if v_intent.provider_payment_key is distinct from p_provider_payment_key then raise exception 'payment key mismatch'; end if;
    update public.payment_intents set status = 'approved', approved_at = now() where id = v_intent.id;
    insert into public.payment_transactions (
      anonymous_session_id, payment_intent_id, provider, provider_payment_key, order_id, amount_krw, souls, payment_status, raw_payload
    ) values (
      v_intent.anonymous_session_id, v_intent.id, v_intent.provider, p_provider_payment_key, v_intent.order_id,
      v_intent.amount_krw, v_intent.souls, '4', p_raw_payload
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

revoke all on function public.approve_soul_purchase(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.approve_soul_purchase(uuid, text, jsonb) to service_role;

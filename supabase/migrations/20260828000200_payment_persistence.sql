create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  anonymous_session_id uuid not null references public.anonymous_sessions(id) on delete restrict,
  soul_profile_id text not null references public.soul_profiles(id) on delete restrict,
  order_id text not null unique,
  pack_id text not null,
  amount_krw integer not null check (amount_krw > 0),
  souls integer not null check (souls > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'failed', 'canceled', 'expired')),
  provider text not null default 'toss',
  provider_payment_key text unique,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  failed_at timestamptz,
  expires_at timestamptz not null
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  anonymous_session_id uuid not null references public.anonymous_sessions(id) on delete restrict,
  payment_intent_id uuid not null unique references public.payment_intents(id) on delete restrict,
  provider text not null,
  provider_payment_key text not null unique,
  order_id text not null unique,
  amount_krw integer not null,
  souls integer not null,
  payment_status text not null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.soul_ledger (
  id uuid primary key default gen_random_uuid(),
  anonymous_session_id uuid not null references public.anonymous_sessions(id) on delete restrict,
  change_amount integer not null,
  reason text not null,
  reference_id uuid not null,
  created_at timestamptz not null default now(),
  unique (anonymous_session_id, reason, reference_id)
);

alter table public.payment_intents enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.soul_ledger enable row level security;

revoke all on table public.payment_intents from anon, authenticated;
revoke all on table public.payment_transactions from anon, authenticated;
revoke all on table public.soul_ledger from anon, authenticated;

create or replace function public.approve_soul_purchase(
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
  v_balance integer;
begin
  select * into v_intent
  from public.payment_intents
  where id = p_payment_intent_id
  for update;

  if not found then
    raise exception 'payment intent not found';
  end if;

  if v_intent.status = 'approved' then
    if v_intent.provider_payment_key is distinct from p_provider_payment_key then
      raise exception 'payment key mismatch';
    end if;
  elsif v_intent.status = 'pending' then
    update public.payment_intents
    set status = 'approved', provider_payment_key = p_provider_payment_key, approved_at = now()
    where id = v_intent.id;

    insert into public.payment_transactions (
      anonymous_session_id, payment_intent_id, provider, provider_payment_key,
      order_id, amount_krw, souls, payment_status, raw_payload
    ) values (
      v_intent.anonymous_session_id, v_intent.id, 'toss', p_provider_payment_key,
      v_intent.order_id, v_intent.amount_krw, v_intent.souls, 'DONE', p_raw_payload
    ) on conflict (payment_intent_id) do nothing;

    insert into public.soul_ledger (anonymous_session_id, change_amount, reason, reference_id)
    values (v_intent.anonymous_session_id, v_intent.souls, 'purchase', v_intent.id)
    on conflict (anonymous_session_id, reason, reference_id) do nothing;
  else
    raise exception 'payment intent is not pending';
  end if;

  select coalesce(sum(change_amount), 0)::integer into v_balance
  from public.soul_ledger
  where anonymous_session_id = v_intent.anonymous_session_id;

  return jsonb_build_object('balance', v_balance);
end;
$$;

revoke all on function public.approve_soul_purchase(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.approve_soul_purchase(uuid, text, jsonb) to service_role;

create table if not exists public.soul_content_generation_locks (
  soul_profile_id text not null references public.soul_profiles(id) on delete cascade,
  content_type text not null,
  generation_key text not null,
  claim_id uuid not null,
  lease_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (soul_profile_id, content_type, generation_key)
);

alter table public.soul_content_generation_locks enable row level security;
revoke all on table public.soul_content_generation_locks from anon, authenticated;

create or replace function public.claim_soul_content_generation(
  p_profile_id text,
  p_content_type text,
  p_generation_key text,
  p_claim_id uuid
) returns boolean language plpgsql security definer set search_path = public as $$
begin
  delete from public.soul_content_generation_locks
  where soul_profile_id = p_profile_id
    and content_type = p_content_type
    and generation_key = p_generation_key
    and lease_expires_at <= now();

  insert into public.soul_content_generation_locks (
    soul_profile_id, content_type, generation_key, claim_id, lease_expires_at
  ) values (
    p_profile_id, p_content_type, p_generation_key, p_claim_id, now() + interval '3 minutes'
  ) on conflict (soul_profile_id, content_type, generation_key) do nothing;

  return found;
end; $$;

create or replace function public.release_soul_content_generation(
  p_profile_id text,
  p_content_type text,
  p_generation_key text,
  p_claim_id uuid
) returns void language sql security definer set search_path = public as $$
  delete from public.soul_content_generation_locks
  where soul_profile_id = p_profile_id
    and content_type = p_content_type
    and generation_key = p_generation_key
    and claim_id = p_claim_id;
$$;

revoke all on function public.claim_soul_content_generation(text, text, text, uuid) from public, anon, authenticated;
revoke all on function public.release_soul_content_generation(text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.claim_soul_content_generation(text, text, text, uuid) to service_role;
grant execute on function public.release_soul_content_generation(text, text, text, uuid) to service_role;

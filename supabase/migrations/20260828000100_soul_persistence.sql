create extension if not exists pgcrypto;

create table if not exists public.anonymous_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  created_at timestamptz not null default now()
);

create table if not exists public.soul_profiles (
  id text primary key,
  soul_hash text not null,
  display_soul_id text not null,
  input_version text not null,
  engine_version text not null,
  profile jsonb not null,
  created_at timestamptz not null default now(),
  unique (soul_hash, input_version, engine_version)
);

create table if not exists public.soul_profile_access (
  id uuid primary key default gen_random_uuid(),
  soul_profile_id text not null references public.soul_profiles(id) on delete cascade,
  anonymous_session_id uuid references public.anonymous_sessions(id) on delete cascade,
  result_token_hash text,
  created_at timestamptz not null default now(),
  constraint soul_profile_access_one_credential check (
    num_nonnulls(anonymous_session_id, result_token_hash) = 1
  ),
  constraint soul_profile_access_credential_unique unique nulls not distinct (
    soul_profile_id,
    anonymous_session_id,
    result_token_hash
  )
);

create index if not exists soul_profile_access_token_lookup
  on public.soul_profile_access (result_token_hash)
  where result_token_hash is not null;

create table if not exists public.soul_contents (
  id uuid primary key default gen_random_uuid(),
  soul_profile_id text not null references public.soul_profiles(id) on delete cascade,
  content_type text not null,
  generation_key text not null default 'default',
  content jsonb not null,
  is_unlocked boolean not null default false,
  generated_by text not null default 'local',
  created_at timestamptz not null default now(),
  unlocked_at timestamptz,
  unique (soul_profile_id, content_type, generation_key)
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  anonymous_session_id uuid references public.anonymous_sessions(id) on delete set null,
  event_name text not null,
  event_properties jsonb not null default '{}'::jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  created_at timestamptz not null default now()
);

alter table public.anonymous_sessions enable row level security;
alter table public.soul_profiles enable row level security;
alter table public.soul_profile_access enable row level security;
alter table public.soul_contents enable row level security;
alter table public.analytics_events enable row level security;

revoke all on table public.anonymous_sessions from anon, authenticated;
revoke all on table public.soul_profiles from anon, authenticated;
revoke all on table public.soul_profile_access from anon, authenticated;
revoke all on table public.soul_contents from anon, authenticated;
revoke all on table public.analytics_events from anon, authenticated;

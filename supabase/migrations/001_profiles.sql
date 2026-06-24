-- ============================================================
-- Drugbox — Migration 001: Profiles
-- Extends Supabase auth.users with professional profile data
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  headline text,
  company text,
  location text,
  country text,
  bio text,
  avatar_url text,
  cover_url text,
  account_type text not null default 'professional' check (account_type in ('professional','company','admin')),
  verified boolean not null default false,
  certifications text,         -- comma-separated claimed certs (e.g. "WHO-GMP, EDA, ISO 9001")
  certs_verified_at timestamptz, -- null = claimed only, not yet verified by Drugbox staff
  website text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for common filtered lookups
create index idx_profiles_account_type on public.profiles(account_type);
create index idx_profiles_country on public.profiles(country);
create index idx_profiles_verified on public.profiles(verified) where verified = true;

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', 'New User'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — profiles
-- ============================================================
alter table public.profiles enable row level security;

-- Anyone authenticated can view any profile (public professional network)
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- A user can only insert their OWN profile row (id must match their auth uid)
-- In practice this is handled by the trigger, but this policy blocks manual inserts of other ids.
create policy "profiles_insert_self_only"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- A user can only update their OWN profile — never someone else's
create policy "profiles_update_self_only"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- No deletes allowed via the API; account deletion is handled via a server-side
-- admin process tied to auth.users cascade, not exposed to clients directly.
-- (Deliberately no delete policy = delete is denied by default under RLS.)

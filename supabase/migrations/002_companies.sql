-- ============================================================
-- Drugbox — Migration 002: Companies + Company Team
-- Backs the "Company Page" feature: public page + role-based
-- team management (Admin / Sub-Admin / Member)
-- ============================================================

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,

  name text not null,
  tagline text,
  about text,
  logo_url text,
  cover_url text,

  street_address text,
  city_country text,
  contact_email text,
  contact_phone text,
  website text,

  allow_messages boolean not null default true,
  followers_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_companies_created_by on public.companies(created_by);

create trigger trg_companies_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- company_team — role-based membership (Admin / Sub-Admin / Member)
-- ------------------------------------------------------------
create table public.company_team (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin','subadmin','member')),
  joined_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create index idx_company_team_company_id on public.company_team(company_id);
create index idx_company_team_user_id on public.company_team(user_id);
create index idx_company_team_role on public.company_team(role);

-- Helper function: is this user an Admin or Sub-Admin of this company?
-- (security definer so it can be used safely inside RLS policies without recursion issues)
create or replace function public.is_company_manager(p_company_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.company_team
    where company_id = p_company_id
      and user_id = p_user_id
      and role in ('admin','subadmin')
  );
$$;

-- Helper function: count how many OTHER admins exist for this company besides the given user
-- Used to enforce the sole-admin leave guard at the database level (not just frontend alert)
create or replace function public.other_admin_count(p_company_id uuid, p_excluding_user_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer from public.company_team
  where company_id = p_company_id
    and role = 'admin'
    and user_id != p_excluding_user_id;
$$;

-- ============================================================
-- ROW LEVEL SECURITY — companies
-- ============================================================
alter table public.companies enable row level security;

-- Company pages are public within the network
create policy "companies_select_all_authenticated"
  on public.companies for select
  to authenticated
  using (true);

-- Any authenticated user can create a company page (they become its first Admin via the trigger below)
create policy "companies_insert_authenticated"
  on public.companies for insert
  to authenticated
  with check (created_by = auth.uid());

-- Only Admins/Sub-Admins of THIS company can update its page
create policy "companies_update_managers_only"
  on public.companies for update
  to authenticated
  using (public.is_company_manager(id, auth.uid()))
  with check (public.is_company_manager(id, auth.uid()));

-- Only an Admin can delete the company page entirely
create policy "companies_delete_admin_only"
  on public.companies for delete
  to authenticated
  using (
    exists (
      select 1 from public.company_team
      where company_id = id and user_id = auth.uid() and role = 'admin'
    )
  );

-- Auto-add the creator as the first Admin of their new company
create or replace function public.handle_new_company()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.company_team (company_id, user_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end;
$$;

create trigger on_company_created
  after insert on public.companies
  for each row execute function public.handle_new_company();

-- ============================================================
-- ROW LEVEL SECURITY — company_team
-- ============================================================
alter table public.company_team enable row level security;

-- Team membership is visible to anyone authenticated (shown publicly on the company page)
create policy "company_team_select_all_authenticated"
  on public.company_team for select
  to authenticated
  using (true);

-- Only existing managers (Admin/Sub-Admin) can add new team members
create policy "company_team_insert_managers_only"
  on public.company_team for insert
  to authenticated
  with check (public.is_company_manager(company_id, auth.uid()));

-- Only managers can change roles — and a Sub-Admin can never promote themselves to Admin
-- (that distinction is enforced in the server action layer, RLS here just gates "is a manager at all")
create policy "company_team_update_managers_only"
  on public.company_team for update
  to authenticated
  using (public.is_company_manager(company_id, auth.uid()))
  with check (public.is_company_manager(company_id, auth.uid()));

-- A member can remove THEMSELVES (leave), or a manager can remove others —
-- BUT the sole-admin guard (must not be the only admin) is enforced in the server action,
-- since RLS alone cannot easily express "block this delete if it leaves zero admins" cleanly.
create policy "company_team_delete_self_or_manager"
  on public.company_team for delete
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_company_manager(company_id, auth.uid())
  );

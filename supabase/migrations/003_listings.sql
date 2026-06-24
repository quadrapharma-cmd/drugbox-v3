-- ============================================================
-- Drugbox — Migration 003: Listings (UNIFIED)
-- One table backs Marketplace, Jobs, and Company Page "Products" —
-- they are different VIEWS of the same data, never duplicated.
-- ============================================================

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,

  category text not null check (category in (
    'supply','demand','cmo','equipment','license','service','job','training'
  )),

  -- Dual-intent: every category has a role direction
  role text not null check (role in ('offering','seeking')),

  title text not null,
  description text,

  -- Sub-type used only when category = 'supply' or 'demand'
  -- (raw material / finished pharma / cosmetic / supplement / medical device)
  product_subtype text check (product_subtype in (
    'rawmaterial','pharma','cosmetic','supplement','device'
  )),

  -- Generic commercial fields
  price_amount numeric(12,2),
  price_unit text,
  moq text,
  certifications text,

  -- Job-specific fields (only relevant when category = 'job')
  employment_type text check (employment_type in ('fulltime','parttime','contract','remote')),
  seniority_level text check (seniority_level in ('exec','senior','mid','junior','entry')),
  department text,
  salary_min numeric(12,2),
  salary_max numeric(12,2),
  salary_hidden boolean default false,

  -- Status & lifecycle
  status text not null default 'active' check (status in ('active','paused','expired','sold','deleted')),
  boosted boolean not null default false,
  boosted_until timestamptz,
  expires_at timestamptz,

  -- Media
  photo_url text,

  views_count integer not null default 0,
  inquiries_count integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes — every foreign key + every filtered column gets one
create index idx_listings_user_id on public.listings(user_id);
create index idx_listings_company_id on public.listings(company_id);
create index idx_listings_category on public.listings(category);
create index idx_listings_role on public.listings(role);
create index idx_listings_status on public.listings(status) where status = 'active';
create index idx_listings_seniority on public.listings(seniority_level) where category = 'job';
create index idx_listings_boosted on public.listings(boosted) where boosted = true;
create index idx_listings_created_at on public.listings(created_at desc);

create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — listings
-- ============================================================
alter table public.listings enable row level security;

-- Everyone authenticated can browse active listings (Marketplace/Jobs/Company products are public within the network)
create policy "listings_select_active_public"
  on public.listings for select
  to authenticated
  using (status = 'active');

-- Owners can always see their OWN listings regardless of status (paused, expired, sold, etc.)
create policy "listings_select_own_any_status"
  on public.listings for select
  to authenticated
  using (user_id = auth.uid());

-- A user can only create a listing AS THEMSELVES — never spoofing another user_id.
-- If attaching to a company_id, they must be a manager (Admin/Sub-Admin) of that company.
create policy "listings_insert_self_only"
  on public.listings for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (company_id is null or public.is_company_manager(company_id, auth.uid()))
  );

-- A user can only update their OWN listing
create policy "listings_update_own_only"
  on public.listings for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- A user can only delete (or soft-delete via status) their OWN listing
create policy "listings_delete_own_only"
  on public.listings for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- 010_company_followers.sql
-- BUG FIX: the Company page has two "Follow" buttons that never did
-- anything — there was no table to record who follows a company at all,
-- only a static `companies.followers_count` integer with nothing keeping
-- it in sync. This migration adds the real relationship table.
-- ============================================================

create table public.company_followers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create index idx_company_followers_company on public.company_followers(company_id);
create index idx_company_followers_user on public.company_followers(user_id);

alter table public.company_followers enable row level security;

-- Anyone authenticated can see who follows a company (counts are public)
create policy "company_followers_select_all"
  on public.company_followers for select
  to authenticated
  using (true);

-- You can only ever follow as yourself
create policy "company_followers_insert_self_only"
  on public.company_followers for insert
  to authenticated
  with check (user_id = auth.uid());

-- You can only unfollow your own follow record
create policy "company_followers_delete_self_only"
  on public.company_followers for delete
  to authenticated
  using (user_id = auth.uid());

-- Live count of followers for a company — computed from the real table
-- rather than trusting the (now-deprecated) static followers_count column.
create or replace function public.get_company_followers_count(p_company_id uuid)
returns integer
language sql
stable
as $$
  select count(*)::integer from public.company_followers where company_id = p_company_id;
$$;

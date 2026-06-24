-- ============================================================
-- Drugbox — Migration 004: Groups + Group Members
-- Same Admin/Sub-Admin/Member role pattern as company_team
-- ============================================================

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  emoji text default '👥',
  is_public boolean not null default true,
  members_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_groups_created_by on public.groups(created_by);

create trigger trg_groups_updated_at
  before update on public.groups
  for each row execute function public.set_updated_at();

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin','subadmin','member')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create index idx_group_members_group_id on public.group_members(group_id);
create index idx_group_members_user_id on public.group_members(user_id);
create index idx_group_members_role on public.group_members(role);

-- Reuse the same manager-check pattern as companies, scoped to groups
create or replace function public.is_group_manager(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id
      and user_id = p_user_id
      and role in ('admin','subadmin')
  );
$$;

create or replace function public.other_group_admin_count(p_group_id uuid, p_excluding_user_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer from public.group_members
  where group_id = p_group_id
    and role = 'admin'
    and user_id != p_excluding_user_id;
$$;

-- Auto-add creator as first Admin
create or replace function public.handle_new_group()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end;
$$;

create trigger on_group_created
  after insert on public.groups
  for each row execute function public.handle_new_group();

-- ============================================================
-- ROW LEVEL SECURITY — groups
-- ============================================================
alter table public.groups enable row level security;

create policy "groups_select_all_authenticated"
  on public.groups for select
  to authenticated
  using (true);

create policy "groups_insert_authenticated"
  on public.groups for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "groups_update_managers_only"
  on public.groups for update
  to authenticated
  using (public.is_group_manager(id, auth.uid()))
  with check (public.is_group_manager(id, auth.uid()));

create policy "groups_delete_admin_only"
  on public.groups for delete
  to authenticated
  using (
    exists (
      select 1 from public.group_members
      where group_id = id and user_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- ROW LEVEL SECURITY — group_members
-- ============================================================
alter table public.group_members enable row level security;

create policy "group_members_select_all_authenticated"
  on public.group_members for select
  to authenticated
  using (true);

-- A user can join a public group themselves (insert their own membership row),
-- OR a manager can add someone else
create policy "group_members_insert_self_or_manager"
  on public.group_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or public.is_group_manager(group_id, auth.uid())
  );

create policy "group_members_update_managers_only"
  on public.group_members for update
  to authenticated
  using (public.is_group_manager(group_id, auth.uid()))
  with check (public.is_group_manager(group_id, auth.uid()));

-- A member can remove themselves (leave), or a manager can remove others.
-- Sole-admin leave guard enforced in the server action layer (see actions/groups.ts).
create policy "group_members_delete_self_or_manager"
  on public.group_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_group_manager(group_id, auth.uid())
  );

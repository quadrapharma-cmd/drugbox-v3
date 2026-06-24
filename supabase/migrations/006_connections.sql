-- ============================================================
-- Drugbox — Migration 006: Connections (My Network)
-- Professional connection requests between users.
-- ============================================================

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,

  constraint connections_not_self check (requester_id != addressee_id),
  unique (requester_id, addressee_id)
);

create index idx_connections_requester on public.connections(requester_id);
create index idx_connections_addressee on public.connections(addressee_id);
create index idx_connections_status on public.connections(status);

-- ============================================================
-- ROW LEVEL SECURITY — connections
-- ============================================================
alter table public.connections enable row level security;

-- A user can see a connection row only if they're the requester or the addressee
create policy "connections_select_involved_only"
  on public.connections for select
  to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

-- A user can only send a request AS THEMSELVES
create policy "connections_insert_as_requester_only"
  on public.connections for insert
  to authenticated
  with check (requester_id = auth.uid());

-- Only the ADDRESSEE can accept/decline (the requester cannot self-approve their own request)
create policy "connections_update_addressee_only"
  on public.connections for update
  to authenticated
  using (addressee_id = auth.uid())
  with check (addressee_id = auth.uid());

-- Either party can remove/cancel a connection
create policy "connections_delete_involved_only"
  on public.connections for delete
  to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

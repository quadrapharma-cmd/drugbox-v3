-- ============================================================
-- Drugbox — Migration 005: Messages
-- Direct messaging. RLS strictly limits visibility to the two
-- participants of a conversation — this is the highest-risk
-- table for privacy leaks if RLS is wrong.
-- ============================================================

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,

  body text,
  image_url text,

  -- Optional context link: which listing is this conversation about?
  -- (powers the "context banner" shown in the Messages UI)
  listing_id uuid references public.listings(id) on delete set null,

  read_at timestamptz,
  created_at timestamptz not null default now(),

  constraint messages_not_self check (sender_id != receiver_id)
);

create index idx_messages_sender_id on public.messages(sender_id);
create index idx_messages_receiver_id on public.messages(receiver_id);
create index idx_messages_listing_id on public.messages(listing_id);
create index idx_messages_unread on public.messages(receiver_id, read_at) where read_at is null;
create index idx_messages_created_at on public.messages(created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY — messages
-- ============================================================
alter table public.messages enable row level security;

-- A user can ONLY see messages where they are the sender or the receiver.
-- This is the single most important policy in the whole schema for privacy.
create policy "messages_select_participants_only"
  on public.messages for select
  to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());

-- A user can only send a message AS THEMSELVES (sender_id must match their own auth uid)
create policy "messages_insert_as_sender_only"
  on public.messages for insert
  to authenticated
  with check (sender_id = auth.uid());

-- Only the receiver can mark a message as read (sender cannot tamper with read status,
-- and cannot edit message content after sending — only read_at is ever updated)
create policy "messages_update_read_receipt_only"
  on public.messages for update
  to authenticated
  using (receiver_id = auth.uid())
  with check (receiver_id = auth.uid());

-- No deletes exposed via API (messages are permanent records); deliberately no delete policy.

-- Enable Realtime for instant message delivery
alter publication supabase_realtime add table public.messages;

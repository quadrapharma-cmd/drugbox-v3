-- ============================================================
-- 011_harden_messages_read_receipt.sql
-- SECURITY HARDENING: messages_update_read_receipt_only (005_messages.sql)
-- restricts WHICH ROW a receiver can update (their own received messages)
-- but RLS alone cannot restrict WHICH COLUMNS they touch. As written, a
-- receiver calling the Supabase API directly (bypassing the app, which
-- only ever sends {read_at}) could legally update `body`, `sender_id`,
-- or other fields on a message they received — tampering with what the
-- sender appears to have said. The app itself never does this, but RLS
-- is supposed to be the real boundary, not just "the app behaves."
--
-- This trigger closes the gap at the database level: any UPDATE on
-- messages may only change `read_at`. Every other column must stay
-- identical to its previous value, regardless of who performs the update.
-- ============================================================

create or replace function public.enforce_messages_read_only_update()
returns trigger
language plpgsql
as $$
begin
  if new.sender_id is distinct from old.sender_id
     or new.receiver_id is distinct from old.receiver_id
     or new.body is distinct from old.body
     or new.image_url is distinct from old.image_url
     or new.listing_id is distinct from old.listing_id
     or new.created_at is distinct from old.created_at
  then
    raise exception 'Only read_at may be updated on an existing message';
  end if;
  return new;
end;
$$;

create trigger trg_messages_read_only_update
  before update on public.messages
  for each row execute function public.enforce_messages_read_only_update();

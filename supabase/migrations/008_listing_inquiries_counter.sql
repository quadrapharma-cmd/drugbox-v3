-- ============================================================
-- 008_listing_inquiries_counter.sql
-- BUG FIX: actions/listings.ts calls supabase.rpc('increment_listing_inquiries', ...)
-- when a user inquires about a listing, but this function was never created.
-- As a result, listings.inquiries_count silently never increments.
-- This migration adds the missing function.
-- ============================================================

create or replace function public.increment_listing_inquiries(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.listings
  set inquiries_count = inquiries_count + 1
  where id = p_listing_id;
end;
$$;

-- Allow authenticated users to call this function (it only ever increments
-- a counter on a listing that isn't their own — enforced in application code
-- via the inquireAboutListing action, which already blocks self-inquiries).
grant execute on function public.increment_listing_inquiries(uuid) to authenticated;

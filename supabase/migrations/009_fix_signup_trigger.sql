-- ============================================================
-- 009_fix_signup_trigger.sql
-- BUG FIX: handle_new_user() only ever copied `name` from signup metadata
-- into profiles. The Signup page collects `headline` and `company` too and
-- sends them as auth metadata, but the trigger silently dropped them — so
-- every new user ended up with an empty headline/company regardless of what
-- they typed in the form.
--
-- Also adds basic length caps, since neither the app nor the DB enforced
-- any limit on `name` (a malicious or accidental huge string could be
-- written directly via raw_user_meta_data, bypassing app-level sanitization
-- since signup calls supabase.auth.signUp directly from the client).
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, headline, company)
  values (
    new.id,
    new.email,
    left(coalesce(new.raw_user_meta_data->>'name', 'New User'), 120),
    left(coalesce(new.raw_user_meta_data->>'headline', ''), 160),
    left(coalesce(new.raw_user_meta_data->>'company', ''), 160)
  );
  return new;
end;
$$;

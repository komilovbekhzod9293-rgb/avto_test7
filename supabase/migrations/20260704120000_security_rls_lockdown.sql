-- ============================================================================
-- SECURITY HARDENING — lock content + customer tables behind edge functions.
--
-- WHY: with the public anon key (shipped in the site's JS bundle) these tables
-- were readable/updatable directly via PostgREST, bypassing every edge-function
-- check — the whole question bank + answer key + customer phone list was
-- downloadable by anyone. RLS was never enabled on them.
--
-- SAFE FOR THE SITE: the app reads these ONLY through edge functions, which use
-- the service_role key (service_role has BYPASSRLS), so enabling RLS with no
-- anon/authenticated policies does NOT break anything — it only closes the
-- public anon-key backdoor.
--
-- Run this once in Supabase → SQL Editor (project ziqzprosgzevkdfwyotl).
-- ============================================================================

begin;

-- 1) Enable RLS. No policies for anon/authenticated => deny-by-default.
alter table public.lessons        enable row level security;
alter table public.topics         enable row level security;
alter table public.questions      enable row level security;
alter table public.answers        enable row level security;
alter table public.allowed_phones enable row level security;

-- 2) Revoke direct PostgREST privileges from the public API roles
--    (belt-and-suspenders; edge functions use service_role and are unaffected).
revoke all on public.lessons        from anon, authenticated;
revoke all on public.topics         from anon, authenticated;
revoke all on public.questions      from anon, authenticated;
revoke all on public.answers        from anon, authenticated;
revoke all on public.allowed_phones from anon, authenticated;

commit;

-- After running, verify from a terminal (should now be blocked / empty):
--   curl 'https://ziqzprosgzevkdfwyotl.supabase.co/rest/v1/answers?select=*&limit=1' \
--     -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>"
-- Expected: permission-denied error or [] instead of real answer rows.

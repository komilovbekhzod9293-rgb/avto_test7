-- 7-day trial window for new signups. Set at registration (created_at + 7
-- days); NULL means "no expiry enforced" -- keeps every pre-existing
-- account (registered before this migration) grandfathered with unlimited
-- trial, since retroactively cutting them off without warning would be
-- unfair. Only rows with a value set going forward are checked.
--
-- n8n handles actually deleting expired trial rows on a schedule; get-data
-- also checks this server-side so an expired trial can't see paid content
-- during the window before n8n's next run gets to it.
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS trial_expires_at timestamptz;

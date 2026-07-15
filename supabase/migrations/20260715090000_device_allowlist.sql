-- Replace the single-device lock with a small per-account device allowlist.
--
-- Why: device_id lives in the browser's localStorage, which is per-origin and
-- wiped by a cache clear. One account legitimately means a phone + a laptop +
-- the Telegram in-app browser, and moving avtotest7.com -> prava-on.com reset
-- every device_id at once, so a "1 account = 1 device" rule locked out the
-- whole user base. An allowlist of a few devices still blocks handing the
-- password around a class (the 4th device must confirm via Telegram) without
-- punishing a normal student.
--
-- Additive and safe to run while the old code is live: the old functions
-- simply ignore the new column.

ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS device_ids text[] NOT NULL DEFAULT '{}';

-- Seed each account's currently bound device so nobody is logged out when the
-- list-based check goes live.
UPDATE public.app_users
SET device_ids = ARRAY[device_id]
WHERE device_id IS NOT NULL
  AND device_id <> ''
  AND device_ids = '{}';

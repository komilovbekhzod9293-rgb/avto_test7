-- Payment now grants real, time-limited access instead of a manual
-- permanent allowlist entry. expires_at is nullable so existing/manually
-- added rows (owner adds a phone by hand for cash payments etc.) keep
-- meaning "never expires" -- only rows we set an expiry on ourselves expire.
alter table public.allowed_phones
  add column if not exists expires_at timestamptz,
  add column if not exists tariff text;

-- Snapshot of the buyer's name at time of purchase (app_users has no name
-- fields -- login/phone only -- so this is collected at checkout).
alter table public.payments
  add column if not exists first_name text,
  add column if not exists last_name text;

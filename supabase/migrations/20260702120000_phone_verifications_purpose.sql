-- Distinguish registration verifications from device-switch login
-- verifications, and remember which account a login verification belongs
-- to, so the site can resume the correct flow purely from a verification_id
-- passed back via URL (works even if the "return to site" link opens in a
-- brand new browser tab/app, which loses any client-side session state).

ALTER TABLE public.phone_verifications
  ADD COLUMN purpose text NOT NULL DEFAULT 'register' CHECK (purpose IN ('register', 'login')),
  ADD COLUMN account_login text;

-- Allow a third verification purpose: password reset via the Telegram bot
-- (same phone-ownership proof used for registration and device switches).

ALTER TABLE public.phone_verifications
  DROP CONSTRAINT IF EXISTS phone_verifications_purpose_check;

ALTER TABLE public.phone_verifications
  ADD CONSTRAINT phone_verifications_purpose_check CHECK (purpose IN ('register', 'login', 'reset'));

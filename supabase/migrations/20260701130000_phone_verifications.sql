-- Pending phone-number verifications done via the Telegram bot, consumed by
-- auth-register once verified=true (see phone-verify and telegram-webhook
-- edge functions).

CREATE TABLE public.phone_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  telegram_chat_id text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;
-- No policies: only edge functions (service-role key) touch this table.

CREATE INDEX idx_phone_verifications_telegram_chat_id ON public.phone_verifications (telegram_chat_id);

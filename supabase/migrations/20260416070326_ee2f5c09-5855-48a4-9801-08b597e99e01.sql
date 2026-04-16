
CREATE TABLE public.phone_check_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  phone_hash text NOT NULL,
  attempted_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.phone_check_attempts ENABLE ROW LEVEL SECURITY;

-- No public access at all — only service role can read/write
-- No policies = fully locked down

CREATE INDEX idx_phone_check_attempts_ip ON public.phone_check_attempts (ip_hash, attempted_at);
CREATE INDEX idx_phone_check_attempts_phone ON public.phone_check_attempts (phone_hash, attempted_at);

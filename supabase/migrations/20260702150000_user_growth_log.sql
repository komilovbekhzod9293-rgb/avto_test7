-- "Foydalanuvchilar soni" counter needs a number that only ever grows, but
-- allowed_phones rows get deleted whenever a student's paid access period
-- (15-30 days) expires -- counting live rows there would make the number
-- shrink, which defeats the point of a social-proof counter. Log every
-- phone ever granted access permanently instead.

CREATE TABLE public.user_growth_log (
  phone text PRIMARY KEY,
  first_seen_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_growth_log ENABLE ROW LEVEL SECURITY;
-- No policies: only edge functions (service-role key) touch this table.

-- Backfill everyone currently granted access, so nobody active today is
-- lost from the count once their allowed_phones row is later removed.
INSERT INTO public.user_growth_log (phone)
SELECT telefon_raqami FROM public.allowed_phones
ON CONFLICT (phone) DO NOTHING;

-- Every future grant (owner adds a new student's number) permanently adds
-- to the log, even after that phone is eventually removed again.
CREATE OR REPLACE FUNCTION public.log_allowed_phone_growth()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_growth_log (phone)
  VALUES (NEW.telefon_raqami)
  ON CONFLICT (phone) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_log_allowed_phone_growth ON public.allowed_phones;
CREATE TRIGGER trg_log_allowed_phone_growth
AFTER INSERT ON public.allowed_phones
FOR EACH ROW EXECUTE FUNCTION public.log_allowed_phone_growth();

-- Manual baseline for people who used the site before this log existed
-- (their allowed_phones rows were already deleted by the time this was
-- built). Owner's estimate: ~500.
CREATE TABLE public.site_stats (
  key text PRIMARY KEY,
  value bigint NOT NULL
);
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

INSERT INTO public.site_stats (key, value) VALUES ('user_count_baseline', 500)
ON CONFLICT (key) DO NOTHING;

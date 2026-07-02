-- "Foydalanuvchilar soni" counter needs a number that only ever grows, but
-- allowed_phones rows get deleted whenever a student's paid access period
-- (15-30 days) expires -- counting live rows there would make the number
-- shrink. A single incrementing counter (not a per-phone log) keeps this
-- cheap: one row, one UPDATE per new student, no growing table to store.

CREATE TABLE public.site_stats (
  key text PRIMARY KEY,
  value bigint NOT NULL
);
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
-- No policies: only edge functions (service-role key) touch this table.

-- Seed with the owner's estimate of past users (~500, since their
-- allowed_phones rows are long gone) plus everyone currently granted access.
INSERT INTO public.site_stats (key, value)
VALUES ('user_count', 500 + (SELECT count(*) FROM public.allowed_phones))
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.increment_user_count()
RETURNS trigger AS $$
BEGIN
  UPDATE public.site_stats SET value = value + 1 WHERE key = 'user_count';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_increment_user_count ON public.allowed_phones;
CREATE TRIGGER trg_increment_user_count
AFTER INSERT ON public.allowed_phones
FOR EACH ROW EXECUTE FUNCTION public.increment_user_count();

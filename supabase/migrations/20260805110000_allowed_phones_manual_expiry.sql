-- Manual/n8n inserts into allowed_phones (admin adding a number by hand,
-- outside the Multicard payment flow) used to default to a permanent grant
-- whenever tariff was left empty. Now they default to a 15-day access
-- window instead: if a new row has no tariff and no expires_at set, stamp
-- expires_at = now() + 15 days. Only fires when both are empty, so it never
-- touches rows inserted with an explicit tariff/expiry (the Multicard
-- payment flow always sets both) or a deliberately permanent manual grant
-- (tariff/expires_at set explicitly by whoever inserted it).
--
-- expires_at stays a plain timestamptz (correct absolute instant,
-- consistent with the rest of the schema) -- display in Tashkent time
-- happens in the frontend/n8n, same as everywhere else access expiry is
-- shown.
CREATE OR REPLACE FUNCTION public.set_allowed_phones_manual_expiry()
RETURNS trigger AS $$
BEGIN
  IF NEW.tariff IS NULL AND NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + interval '15 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_allowed_phones_manual_expiry ON public.allowed_phones;
CREATE TRIGGER trg_allowed_phones_manual_expiry
  BEFORE INSERT ON public.allowed_phones
  FOR EACH ROW EXECUTE FUNCTION public.set_allowed_phones_manual_expiry();

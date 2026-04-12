
CREATE TABLE public.phone_devices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text UNIQUE NOT NULL,
  device_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.phone_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.phone_devices FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.phone_devices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.phone_devices FOR UPDATE USING (true);

CREATE OR REPLACE FUNCTION public.update_phone_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_phone_devices_updated_at
  BEFORE UPDATE ON public.phone_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_phone_devices_updated_at();

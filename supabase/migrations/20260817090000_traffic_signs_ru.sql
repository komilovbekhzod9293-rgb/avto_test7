-- Russian translations for traffic_signs (title/description) -- previously
-- only the 7 category names were translated in the frontend; the 248
-- individual signs were Uzbek-only, showing untranslated in RU mode.
ALTER TABLE public.traffic_signs ADD COLUMN IF NOT EXISTS title_ru text;
ALTER TABLE public.traffic_signs ADD COLUMN IF NOT EXISTS description_ru text;

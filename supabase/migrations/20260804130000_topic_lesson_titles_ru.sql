-- Russian titles for topics/lessons, nullable -- only the 26 topics with
-- content in questions_ru have a title_ru so far (lessons 1-5, and not every
-- topic within them). get-data falls back to title_uz_cyr/title when null.
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS title_ru text;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS title_ru text;

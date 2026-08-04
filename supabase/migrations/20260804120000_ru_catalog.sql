-- Parallel Russian question catalog (separate tables, same topic_id references,
-- no per-question alignment with the Uzbek questions/answers tables required).
CREATE TABLE IF NOT EXISTS public.questions_ru (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  question_ru text NOT NULL,
  image_path text,
  order_index integer
);

CREATE TABLE IF NOT EXISTS public.answers_ru (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions_ru(id) ON DELETE CASCADE,
  answer_ru text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false
);

ALTER TABLE public.questions_ru ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers_ru ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read public" ON public.questions_ru;
DROP POLICY IF EXISTS "read public" ON public.answers_ru;
CREATE POLICY "read public" ON public.questions_ru FOR SELECT USING (true);
CREATE POLICY "read public" ON public.answers_ru FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.get_random_test_questions_ru(question_count integer)
RETURNS json AS $$
  SELECT json_agg(row_to_json(t)) FROM (
    SELECT q.id, q.topic_id, q.question_ru, q.image_path, q.order_index,
      (SELECT json_agg(json_build_object(
         'id', a.id, 'question_id', a.question_id,
         'answer_ru', a.answer_ru, 'is_correct', a.is_correct))
       FROM public.answers_ru a WHERE a.question_id = q.id) AS answers
    FROM public.questions_ru q
    ORDER BY random()
    LIMIT question_count
  ) t;
$$ LANGUAGE sql STABLE;

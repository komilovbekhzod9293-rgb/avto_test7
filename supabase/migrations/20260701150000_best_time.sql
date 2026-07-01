-- Fastest-completion record per topic, independent of question count
-- (the question count of that record run is stored alongside it).

ALTER TABLE public.topic_progress
  ADD COLUMN best_time_seconds integer,
  ADD COLUMN best_time_question_count integer;

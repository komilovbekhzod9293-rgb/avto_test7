-- Part A: configurable random-question-count final test ("Yakuniy test"),
-- for everyone. Kept as a brand new function -- the existing
-- get_random_final_test_questions() isn't tracked in any migration (it was
-- created directly in the Supabase dashboard), so it's left untouched
-- rather than edited blind. Returns json (not a typed RETURNS TABLE) so it
-- doesn't need to know the exact column types of questions/answers, which
-- also aren't defined in any tracked migration.
CREATE OR REPLACE FUNCTION public.get_random_test_questions(question_count integer)
RETURNS json AS $$
  SELECT json_agg(row_to_json(t)) FROM (
    SELECT q.id, q.topic_id, q.question_uz_cyr, q.image_path, q.order_index,
      (SELECT json_agg(json_build_object(
         'id', a.id, 'question_id', a.question_id,
         'answer_uz_cyr', a.answer_uz_cyr, 'is_correct', a.is_correct))
       FROM public.answers a WHERE a.question_id = q.id) AS answers
    FROM public.questions q
    ORDER BY random()
    LIMIT question_count
  ) t;
$$ LANGUAGE sql STABLE;

-- Part B: shared "lab computer" account (login: avtotest7). Many school-lab
-- PCs share this one login/password, log in without Telegram verification,
-- and stay logged in forever -- protected instead by restricting it to the
-- learning center's IP address(es), see lab_allowed_ips below.

ALTER TABLE public.app_users ADD COLUMN is_shared boolean NOT NULL DEFAULT false;

CREATE TABLE public.lab_allowed_ips (
  ip text PRIMARY KEY,
  note text
);
ALTER TABLE public.lab_allowed_ips ENABLE ROW LEVEL SECURITY;
-- No policies: only edge functions (service-role key) touch this table.

-- Synthetic phone (not a real number) -- required/unique on app_users, but
-- is_shared accounts skip the allowed_phones check entirely (see
-- _shared/session.ts and auth-login), so a real number isn't needed.
-- session_token is fixed at creation and never rotated -- every lab PC
-- that logs in gets back this same token, so there's no per-device slot to
-- contend over and no limit on how many can be logged in at once.
INSERT INTO public.app_users (phone, login, password_hash, is_shared, session_token)
VALUES (
  'lab-shared-avtotest7',
  'avtotest7',
  '100000$4c5d5db4c874070e75602fe6b66ad032$0aaa60b7630e3eefb1499ca4e6f24956d55144ee1f35fe1de7fc1d5e7c691862',
  true,
  '8104062b-e403-462a-87f3-965f2e2ac340'
)
ON CONFLICT (login) DO NOTHING;

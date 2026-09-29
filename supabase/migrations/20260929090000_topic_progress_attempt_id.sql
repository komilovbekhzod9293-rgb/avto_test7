-- Offline clients queue progress-sync 'set-topic' calls and retry them once
-- back online. A retry is only unsafe when the original request actually
-- reached the server (the client just never saw the response) -- in that
-- case user_stats.tests_taken/correct_answers/wrong_answers, which are
-- incremented additively, would get double-counted. topic_progress itself
-- is already safe to reapply (best_score is a max()).
--
-- last_attempt_id lets the edge function recognize "I already applied this
-- exact attempt" and skip the stats increment on a retry, while still
-- reapplying the (idempotent) best_score/completed upsert.
alter table public.topic_progress
  add column if not exists last_attempt_id text;

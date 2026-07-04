-- Server-side "resume where you left off" for in-progress tests. Previously,
-- the current question index and selected answers only lived in React state:
-- closing the tab/app mid-test (even a 200-question Yakuniy run) lost
-- everything and forced a restart from question 1. This ties the in-progress
-- state to the account (user_id), same as completed-topic progress, so it
-- survives app restarts and follows the student across devices.
create table public.test_sessions (
  user_id uuid primary key references public.app_users(id) on delete cascade,
  test_type text not null check (test_type in ('topic', 'yakuniy')),
  topic_id uuid,
  question_ids jsonb,
  answers jsonb not null default '{}'::jsonb,
  current_index integer not null default 0,
  question_count integer,
  updated_at timestamptz not null default now()
);

alter table public.test_sessions enable row level security;
revoke all on public.test_sessions from anon, authenticated;
-- No policies/grants: all access goes through edge functions using the
-- service-role key (service_role bypasses RLS), matching topic_progress/user_stats.

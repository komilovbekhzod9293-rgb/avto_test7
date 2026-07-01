-- 1v1 "duel" (жанг) battles between friends, plus a global leaderboard RPC.

CREATE TABLE public.duels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  opponent_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  topic_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'declined', 'cancelled')),
  challenger_score integer,
  opponent_score integer,
  total_questions integer,
  challenger_finished boolean NOT NULL DEFAULT false,
  opponent_finished boolean NOT NULL DEFAULT false,
  winner_id uuid REFERENCES public.app_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  completed_at timestamptz,
  CONSTRAINT no_self_duel CHECK (challenger_id <> opponent_id)
);

ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
-- No policies: only edge functions (service-role key) touch this table.

CREATE INDEX idx_duels_opponent ON public.duels (opponent_id, status);
CREATE INDEX idx_duels_challenger ON public.duels (challenger_id, status);

CREATE OR REPLACE FUNCTION public.get_duel_leaderboard()
RETURNS TABLE (
  user_id uuid,
  login text,
  avatar_url text,
  battles bigint,
  correct_answers bigint
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    u.id AS user_id,
    u.login,
    u.avatar_url,
    count(d.id) AS battles,
    sum(CASE WHEN d.challenger_id = u.id THEN coalesce(d.challenger_score, 0) ELSE coalesce(d.opponent_score, 0) END) AS correct_answers
  FROM public.app_users u
  JOIN public.duels d ON (d.challenger_id = u.id OR d.opponent_id = u.id) AND d.status = 'completed'
  GROUP BY u.id, u.login, u.avatar_url
  ORDER BY correct_answers DESC, battles DESC
  LIMIT 100
$$;

-- Personal accounts foundation: login/password accounts tied to allowed_phones,
-- server-side progress sync, friends, and stats (groundwork for future 1v1 feature).

CREATE TABLE public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  login text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  avatar_url text,
  device_id text,
  session_token text,
  session_created_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_app_users_login_lower ON public.app_users (lower(login));
CREATE UNIQUE INDEX idx_app_users_session_token ON public.app_users (session_token) WHERE session_token IS NOT NULL;

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
-- No policies: all access goes through edge functions using the service-role key.

CREATE OR REPLACE FUNCTION public.set_app_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_app_users_updated_at();

CREATE TABLE public.topic_progress (
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL,
  best_score integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, topic_id)
);
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_stats (
  user_id uuid PRIMARY KEY REFERENCES public.app_users(id) ON DELETE CASCADE,
  tests_taken integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  wrong_answers integer NOT NULL DEFAULT 0,
  last_lesson_id uuid,
  last_topic_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT no_self_friend CHECK (requester_id <> addressee_id),
  CONSTRAINT unique_pair UNIQUE (requester_id, addressee_id)
);
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_friendships_addressee ON public.friendships (addressee_id, status);
CREATE INDEX idx_friendships_requester ON public.friendships (requester_id, status);

-- Public bucket for compressed profile avatars (written only by the
-- avatar-upload edge function via the service-role key).
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

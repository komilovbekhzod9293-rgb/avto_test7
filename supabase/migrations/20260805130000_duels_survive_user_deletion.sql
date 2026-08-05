-- challenger_id/opponent_id/winner_id used to CASCADE delete the whole duel
-- row when either player's app_users row was removed -- so deleting a batch
-- of stale trial accounts silently wiped every duel (and leaderboard credit)
-- for the OTHER, still-active player too, as long as they'd ever dueled one
-- of the deleted accounts. Switch to SET NULL: the duel row (and the
-- surviving player's score/leaderboard entry) now survives the other
-- player's account being deleted: only that player's slot goes null.
-- get_duel_leaderboard's join (challenger_id = u.id OR opponent_id = u.id)
-- already handles a null side correctly -- it just won't match on that side.
ALTER TABLE public.duels ALTER COLUMN challenger_id DROP NOT NULL;
ALTER TABLE public.duels ALTER COLUMN opponent_id DROP NOT NULL;

ALTER TABLE public.duels DROP CONSTRAINT IF EXISTS duels_challenger_id_fkey;
ALTER TABLE public.duels ADD CONSTRAINT duels_challenger_id_fkey
  FOREIGN KEY (challenger_id) REFERENCES public.app_users(id) ON DELETE SET NULL;

ALTER TABLE public.duels DROP CONSTRAINT IF EXISTS duels_opponent_id_fkey;
ALTER TABLE public.duels ADD CONSTRAINT duels_opponent_id_fkey
  FOREIGN KEY (opponent_id) REFERENCES public.app_users(id) ON DELETE SET NULL;

ALTER TABLE public.duels DROP CONSTRAINT IF EXISTS duels_winner_id_fkey;
ALTER TABLE public.duels ADD CONSTRAINT duels_winner_id_fkey
  FOREIGN KEY (winner_id) REFERENCES public.app_users(id) ON DELETE SET NULL;

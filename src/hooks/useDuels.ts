import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { safeStorage } from '@/lib/safeStorage';
import { useUserEvent } from '@/hooks/usePresence';

// Slow safety net only -- the server pushes 'duel_invite'/'duel_updated' the
// moment something happens (see useUserEvent below), so this is just a
// fallback in case the realtime socket dropped (backgrounded tab, flaky
// mobile network), not the primary update path anymore.
const SAFETY_NET_INTERVAL = 2 * 60 * 1000;
// A live duel is short-lived and time-sensitive (both players are actively
// waiting on each other), so its safety net stays tighter than the general
// list's -- still 4x fewer requests than the old 5s poll, and only runs
// while a duel is actually in progress, not for every idle user.
const LIVE_DUEL_SAFETY_NET_INTERVAL = 15 * 1000;

interface DuelUser {
  id: string;
  login: string;
  avatar_url: string | null;
}

export interface DuelSummary {
  id: string;
  challenger_id: string;
  opponent_id: string;
  topic_id: string;
  status: 'pending' | 'active' | 'completed' | 'declined' | 'cancelled';
  challenger_score: number | null;
  opponent_score: number | null;
  winner_id: string | null;
  created_at: string;
  opponent_user: DuelUser;
}

interface DuelList {
  incoming: DuelSummary[];
  outgoing: DuelSummary[];
  active: DuelSummary[];
}

export interface DuelDetail {
  id: string;
  challenger_id: string;
  opponent_id: string;
  topic_id: string;
  status: DuelSummary['status'];
  opponent_user: DuelUser;
  my_score: number | null;
  my_finished: boolean;
  opponent_score: number | null;
  opponent_finished: boolean;
  winner_id: string | null;
  total_questions: number | null;
}

export interface LeaderboardRow {
  user_id: string;
  login: string;
  avatar_url: string | null;
  battles: number;
  correct_answers: number;
}

function sessionArgs() {
  return {
    session_token: safeStorage.getItem('session_token'),
    device_id: getDeviceId(),
  };
}

async function callDuels<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await invokeFunction<T>('duels', { action, ...sessionArgs(), ...params });
  if (error) throw new Error(error);
  return data as T;
}

export function useDuelList() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['duel-list'] });
  useUserEvent('duel_invite', invalidate);
  useUserEvent('duel_updated', invalidate);

  return useQuery({
    queryKey: ['duel-list'],
    queryFn: () => callDuels<DuelList>('list'),
    staleTime: SAFETY_NET_INTERVAL,
    refetchInterval: SAFETY_NET_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

export function useDuel(duelId: string | undefined) {
  const queryClient = useQueryClient();
  useUserEvent('duel_updated', (payload) => {
    if (payload.duel_id === duelId) queryClient.invalidateQueries({ queryKey: ['duel', duelId] });
  });

  return useQuery({
    queryKey: ['duel', duelId],
    queryFn: () => callDuels<DuelDetail>('get', { duel_id: duelId }),
    enabled: !!duelId,
    // Safety net while the duel is live: the challenger's "waiting…" screen
    // and the live match both need to notice a change even if a push was
    // missed. Real-time updates (opponent accepted / finished) arrive via
    // 'duel_updated' above almost instantly; this interval rarely does the
    // actual work.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'pending' || status === 'active' ? LIVE_DUEL_SAFETY_NET_INTERVAL : false;
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['duel-leaderboard'],
    queryFn: () => callDuels<LeaderboardRow[]>('leaderboard'),
  });
}

export function useChallengeFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opponentLogin: string) => callDuels<{ duel_id: string }>('challenge', { opponent_login: opponentLogin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duel-list'] });
    },
  });
}

export function useRespondDuel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ duelId, accept }: { duelId: string; accept: boolean }) =>
      callDuels('respond', { duel_id: duelId, accept }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duel-list'] });
    },
  });
}

export function useSubmitDuelResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ duelId, correctCount, totalQuestions }: { duelId: string; correctCount: number; totalQuestions: number }) =>
      callDuels('submit-result', { duel_id: duelId, correct_count: correctCount, total_questions: totalQuestions }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['duel', variables.duelId] });
      queryClient.invalidateQueries({ queryKey: ['duel-list'] });
    },
  });
}

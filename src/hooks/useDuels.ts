import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { safeStorage } from '@/lib/safeStorage';

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
  return useQuery({
    queryKey: ['duel-list'],
    queryFn: () => callDuels<DuelList>('list'),
    // Poll fast so an incoming invite appears within a few seconds (not 30s).
    staleTime: 0,
    refetchInterval: 5 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useDuel(duelId: string | undefined) {
  return useQuery({
    queryKey: ['duel', duelId],
    queryFn: () => callDuels<DuelDetail>('get', { duel_id: duelId }),
    enabled: !!duelId,
    // Poll while PENDING too: the challenger waits on the "waiting…" screen at
    // status 'pending' and must auto-enter the room the moment the opponent
    // accepts (status -> 'active'), without a manual refresh.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'pending' || status === 'active' ? 2000 : false;
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

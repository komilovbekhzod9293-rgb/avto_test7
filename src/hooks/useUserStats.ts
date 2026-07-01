import { useQuery } from '@tanstack/react-query';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';

export interface UserStats {
  tests_taken: number;
  correct_answers: number;
  wrong_answers: number;
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async (): Promise<UserStats> => {
      const { data, error } = await invokeFunction<{ stats: UserStats }>('progress-sync-v2', {
        action: 'get',
        session_token: localStorage.getItem('session_token'),
        device_id: getDeviceId(),
      });
      if (error || !data) throw new Error(error ?? 'unknown_error');
      return data.stats;
    },
  });
}

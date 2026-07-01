import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';

interface FriendUser {
  id: string;
  login: string;
  avatar_url: string | null;
}

interface SearchResult extends FriendUser {
  friendship_status: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
}

interface FriendsList {
  friends: FriendUser[];
  incoming: { friendship_id: string; user: FriendUser }[];
  outgoing: { friendship_id: string; user: FriendUser }[];
}

function sessionArgs() {
  return {
    session_token: localStorage.getItem('session_token'),
    device_id: getDeviceId(),
  };
}

async function callFriends<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke('friends', {
    body: { action, ...sessionArgs(), ...params },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.data ?? data;
}

export function useFriendsList() {
  return useQuery({
    queryKey: ['friends-list'],
    queryFn: () => callFriends<FriendsList>('list'),
  });
}

export function useFriendSearch(query: string) {
  return useQuery({
    queryKey: ['friends-search', query],
    queryFn: () => callFriends<SearchResult[]>('search', { query }),
    enabled: query.trim().length > 0,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addresseeLogin: string) => callFriends('request', { addressee_login: addresseeLogin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends-list'] });
      queryClient.invalidateQueries({ queryKey: ['friends-search'] });
    },
  });
}

export function useRespondFriendRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ friendshipId, accept }: { friendshipId: string; accept: boolean }) =>
      callFriends('respond', { friendship_id: friendshipId, accept }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends-list'] });
    },
  });
}

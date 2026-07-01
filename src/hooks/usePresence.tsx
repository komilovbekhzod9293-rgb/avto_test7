import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { functionsSupabase } from '@/integrations/supabase/functionsClient';

const PresenceContext = createContext<Set<string>>(new Set());

export function PresenceProvider({ children }: { children: ReactNode }) {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    const channel = functionsSupabase.channel('online-users', {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        setOnlineIds(new Set(Object.keys(channel.presenceState())));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      functionsSupabase.removeChannel(channel);
    };
  }, []);

  return <PresenceContext.Provider value={onlineIds}>{children}</PresenceContext.Provider>;
}

export function useOnlineUsers(): Set<string> {
  return useContext(PresenceContext);
}

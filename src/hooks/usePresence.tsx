import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { functionsSupabase } from '@/integrations/supabase/functionsClient';

const PresenceContext = createContext<Set<string>>(new Set());

// PresenceProvider is mounted ONCE at the app root (see App.tsx) so the
// realtime channel survives client-side navigation. If it were mounted
// per-route, every page change would unsubscribe + resubscribe, making the
// user flicker offline to everyone else during the gap.
export function PresenceProvider({ children }: { children: ReactNode }) {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('user_id'));

  // Track the logged-in user id from localStorage so presence starts
  // broadcasting right after login and stops after logout — without a full
  // page reload. 'storage' fires for cross-tab changes; the interval catches
  // same-tab login/logout (localStorage writes don't emit 'storage' locally).
  useEffect(() => {
    const read = () => {
      const id = localStorage.getItem('user_id');
      setUserId((prev) => (prev === id ? prev : id));
    };
    window.addEventListener('storage', read);
    const interval = setInterval(read, 2000);
    return () => {
      window.removeEventListener('storage', read);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setOnlineIds(new Set());
      return;
    }

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
  }, [userId]);

  return <PresenceContext.Provider value={onlineIds}>{children}</PresenceContext.Provider>;
}

export function useOnlineUsers(): Set<string> {
  return useContext(PresenceContext);
}

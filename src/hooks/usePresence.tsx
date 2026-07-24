import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { functionsSupabase } from '@/integrations/supabase/functionsClient';
import { safeStorage } from '@/lib/safeStorage';

// Every event the backend can push to a user's private channel (see
// supabase/functions/_shared/realtime.ts broadcastToUser). Listed explicitly
// because supabase-js binds broadcast listeners per event name -- there's no
// wildcard subscription.
const USER_EVENTS = ['duel_invite', 'duel_updated', 'friend_request', 'friend_accepted', 'access_granted'] as const;
type UserEvent = (typeof USER_EVENTS)[number];
type EventListener = (payload: Record<string, unknown>) => void;

const PresenceContext = createContext<Set<string>>(new Set());
const UserEventsContext = createContext<{ on: (event: UserEvent, cb: EventListener) => () => void }>({
  on: () => () => {},
});

// PresenceProvider is mounted ONCE at the app root (see App.tsx) so the
// realtime channel survives client-side navigation. If it were mounted
// per-route, every page change would unsubscribe + resubscribe, making the
// user flicker offline to everyone else during the gap.
//
// It now does double duty: presence ("who's online") AND a per-user event
// bus (duel invites, friend requests, "your payment went through"). Both
// ride the SAME channel/socket instead of opening a second one -- the app
// used to poll edge functions every few seconds to discover these events;
// now the server pushes them the moment they happen (see
// supabase/functions/_shared/realtime.ts) and consumers (useDuels,
// useFriends, useAuth) just subscribe via useUserEvents() below instead of
// polling. A slow safety-net poll still exists in those hooks in case a
// browser drops the socket (backgrounded tab, flaky mobile network).
export function PresenceProvider({ children }: { children: ReactNode }) {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(() => safeStorage.getItem('user_id'));
  const listenersRef = useRef<Map<UserEvent, Set<EventListener>>>(new Map());

  // Track the logged-in user id from localStorage so presence starts
  // broadcasting right after login and stops after logout — without a full
  // page reload. 'storage' fires for cross-tab changes; the interval catches
  // same-tab login/logout (localStorage writes don't emit 'storage' locally).
  useEffect(() => {
    const read = () => {
      const id = safeStorage.getItem('user_id');
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

    channel.on('presence', { event: 'sync' }, () => {
      setOnlineIds(new Set(Object.keys(channel.presenceState())));
    });

    // Second channel: this user's private event topic (see broadcastToUser).
    // Not "private" in Realtime's RLS sense -- this app has no Supabase Auth
    // to authorize against, so the uuid-named topic is itself the access
    // control (unguessable, same trust model as session_token elsewhere).
    const userChannel = functionsSupabase.channel(`user-${userId}`);
    for (const event of USER_EVENTS) {
      userChannel.on('broadcast', { event }, ({ payload }: { payload: Record<string, unknown> }) => {
        listenersRef.current.get(event)?.forEach((cb) => cb(payload));
      });
    }

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });
    userChannel.subscribe();

    return () => {
      functionsSupabase.removeChannel(channel);
      functionsSupabase.removeChannel(userChannel);
    };
  }, [userId]);

  const on = (event: UserEvent, cb: EventListener) => {
    if (!listenersRef.current.has(event)) listenersRef.current.set(event, new Set());
    listenersRef.current.get(event)!.add(cb);
    return () => listenersRef.current.get(event)?.delete(cb);
  };

  return (
    <PresenceContext.Provider value={onlineIds}>
      <UserEventsContext.Provider value={{ on }}>{children}</UserEventsContext.Provider>
    </PresenceContext.Provider>
  );
}

export function useOnlineUsers(): Set<string> {
  return useContext(PresenceContext);
}

/** Subscribe to a server-pushed event for the current user; auto-unsubscribes on unmount. */
export function useUserEvent(event: UserEvent, callback: EventListener): void {
  const { on } = useContext(UserEventsContext);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => on(event, (payload) => callbackRef.current(payload)), [event, on]);
}

import { useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { hydrateProgressFromServer } from '@/lib/progress';
import { safeStorage } from '@/lib/safeStorage';
import { useUserEvent } from '@/hooks/usePresence';

// Used to be a 30s poll for EVERY open tab, all the time -- the two things
// it actually needs to catch (access granted by a payment, or this device
// getting revoked elsewhere) are either pushed instantly now
// ('access_granted', see useUserEvent below) or don't need second-by-second
// freshness. This interval is just a safety net for a dropped realtime
// socket / revocation while this tab wasn't watching, plus a check whenever
// the tab regains focus (covers "left it open overnight" style staleness).
const SESSION_CHECK_SAFETY_NET_INTERVAL = 3 * 60 * 1000;

// Reading safeStorage.full_access directly during render (as Index.tsx does)
// doesn't subscribe a component to later changes: when checkSession() below
// upgrades a student to full access after their number is added to
// allowed_phones, the lesson list wouldn't re-render to reflect it -- it kept
// showing "call the office" locks until the student happened to trigger some
// unrelated re-render (or hard-refreshed). notifyFullAccessChanged() + the
// useFullAccess() hook (via useSyncExternalStore) make that reactive.
const _fullAccessListeners = new Set<() => void>();

export function notifyFullAccessChanged(): void {
  _fullAccessListeners.forEach((l) => l());
}

function subscribeFullAccess(listener: () => void): () => void {
  _fullAccessListeners.add(listener);
  return () => _fullAccessListeners.delete(listener);
}

function getFullAccessSnapshot(): boolean {
  return safeStorage.getItem('full_access') !== '0';
}

export function useFullAccess(): boolean {
  return useSyncExternalStore(subscribeFullAccess, getFullAccessSnapshot);
}

export function clearSession(): void {
  safeStorage.removeItem('session_token');
  safeStorage.removeItem('login');
  safeStorage.removeItem('user_id');
  safeStorage.removeItem('avatar_url');
  safeStorage.removeItem('full_access');
  notifyFullAccessChanged();
}

export function useAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const hydratedRef = useRef(false);

  const logOut = useCallback((message: string) => {
    clearSession();
    toast({
      title: 'Сессия тугади',
      description: message,
      variant: 'destructive',
    });
    navigate('/auth');
  }, [navigate, toast]);

  const checkSession = useCallback(async () => {
    const sessionToken = safeStorage.getItem('session_token');
    if (!sessionToken) return;

    const { data, error } = await invokeFunction<{ user: { fullAccess?: boolean } }>('session-check', {
      session_token: sessionToken,
      device_id: getDeviceId(),
    });

    if (error === 'network_error') return; // transient: don't log out

    if (error === 'device_revoked') {
      logOut('Сизнинг ҳисобингиздан бошқа қурилмада кирилди');
      return;
    }
    if (error === 'access_revoked' || error === 'invalid_session') {
      logOut('Сизнинг рухсатингиз бекор қилинди');
      return;
    }

    // Keep the trial/full flag fresh (upgrade after purchase, downgrade on expiry)
    // without forcing a re-login.
    if (data?.user && typeof data.user.fullAccess === 'boolean') {
      safeStorage.setItem('full_access', data.user.fullAccess ? '1' : '0');
      notifyFullAccessChanged();
    }

    if (data?.user && !hydratedRef.current) {
      hydratedRef.current = true;
      hydrateProgressFromServer();
    }
  }, [logOut]);

  useUserEvent('access_granted', checkSession);

  useEffect(() => {
    const sessionToken = safeStorage.getItem('session_token');
    if (!sessionToken) return;

    checkSession();
    const interval = setInterval(checkSession, SESSION_CHECK_SAFETY_NET_INTERVAL);

    // Also check right away when the student comes back to the tab -- the
    // most common case a push can miss (socket was closed while backgrounded).
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkSession();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [checkSession]);
}

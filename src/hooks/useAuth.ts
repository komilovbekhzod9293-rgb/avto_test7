import { useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { hydrateProgressFromServer } from '@/lib/progress';
import { safeStorage } from '@/lib/safeStorage';

const SESSION_CHECK_INTERVAL = 30 * 1000; // 30 секунд

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

  useEffect(() => {
    const sessionToken = safeStorage.getItem('session_token');
    if (!sessionToken) return;

    checkSession();
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkSession]);
}

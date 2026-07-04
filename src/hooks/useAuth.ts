import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { hydrateProgressFromServer } from '@/lib/progress';

const SESSION_CHECK_INTERVAL = 30 * 1000; // 30 секунд

export function clearSession(): void {
  localStorage.removeItem('session_token');
  localStorage.removeItem('login');
  localStorage.removeItem('user_id');
  localStorage.removeItem('avatar_url');
  localStorage.removeItem('full_access');
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
    const sessionToken = localStorage.getItem('session_token');
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
      localStorage.setItem('full_access', data.user.fullAccess ? '1' : '0');
    }

    if (data?.user && !hydratedRef.current) {
      hydratedRef.current = true;
      hydrateProgressFromServer();
    }
  }, [logOut]);

  useEffect(() => {
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) return;

    checkSession();
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkSession]);
}

import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { functionsSupabase } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { hydrateProgressFromServer } from '@/lib/progress';

const SESSION_CHECK_INTERVAL = 30 * 1000; // 30 секунд

export function clearSession(): void {
  localStorage.removeItem('session_token');
  localStorage.removeItem('login');
  localStorage.removeItem('user_id');
  localStorage.removeItem('avatar_url');
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

    const { data, error } = await functionsSupabase.functions.invoke('session-check', {
      body: { session_token: sessionToken, device_id: getDeviceId() },
    });

    if (error) return; // network hiccup: don't log out on transient errors

    const payload = data?.data ?? data;
    const errCode = data?.error;

    if (errCode === 'device_revoked') {
      logOut('Сизнинг ҳисобингиздан бошқа қурилмада кирилди');
      return;
    }
    if (errCode === 'access_revoked' || errCode === 'invalid_session') {
      logOut('Сизнинг рухсатингиз бекор қилинди');
      return;
    }

    if (payload?.user && !hydratedRef.current) {
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

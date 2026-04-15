import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AUTH_CHECK_INTERVAL = 8 * 60 * 60 * 1000; // 8 hours
const AUTH_TIMESTAMP_KEY = 'phone_auth_timestamp';

export function usePhoneAuthCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const logOut = useCallback((message: string) => {
    localStorage.removeItem('phone_auth');
    localStorage.removeItem('phone_number');
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
    
    toast({
      title: "Сессия тугади",
      description: message,
      variant: "destructive",
    });
    
    navigate('/auth');
  }, [navigate, toast]);

  const checkPhoneAuth = useCallback(async () => {
    const phone = localStorage.getItem('phone_number');
    const isAuthenticated = localStorage.getItem('phone_auth') === 'true';

    if (!isAuthenticated || !phone) return;

    console.log('Checking phone authentication...');

    try {
      const { data, error } = await supabase.functions.invoke('phone-check', {
        body: { phone: phone.trim() },
      });

      if (error) throw error;

      if (data?.allowed) {
        localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
        console.log('Phone authentication verified successfully');
      } else {
        console.log('Phone authentication failed - logging out');
        logOut('Сизнинг рухсатингиз бекор қилинди');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }, [logOut]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('phone_auth') === 'true';
    if (!isAuthenticated) return;

    const lastCheck = localStorage.getItem(AUTH_TIMESTAMP_KEY);
    const now = Date.now();

    if (!lastCheck) {
      localStorage.setItem(AUTH_TIMESTAMP_KEY, now.toString());
    } else {
      const timeSinceLastCheck = now - parseInt(lastCheck, 10);
      if (timeSinceLastCheck >= AUTH_CHECK_INTERVAL) {
        checkPhoneAuth();
      }
    }

    const intervalId = setInterval(checkPhoneAuth, AUTH_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [checkPhoneAuth]);

  return { checkPhoneAuth };
}

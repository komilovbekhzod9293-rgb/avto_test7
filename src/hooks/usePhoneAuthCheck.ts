import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const AUTH_CHECK_INTERVAL = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
const AUTH_TIMESTAMP_KEY = 'phone_auth_timestamp';

export function usePhoneAuthCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkPhoneAuth = useCallback(async () => {
    const phone = localStorage.getItem('phone_number');
    const isAuthenticated = localStorage.getItem('phone_auth') === 'true';
    const deviceId = localStorage.getItem('device_id');

    if (!isAuthenticated || !phone) {
      return;
    }

    console.log('Checking phone authentication...');

    try {
      // Check webhook
      const response = await fetch('https://n8n.srv1215497.hstgr.cloud/webhook/1f609048-08ae-4a07-9a43-a43960a3854c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await response.json();

      if (data.allowed === 'true' || data.allowed === true) {
        // Also check device binding
        if (deviceId) {
          const { data: existing } = await supabase
            .from('phone_devices')
            .select('device_id')
            .eq('phone', phone.trim())
            .maybeSingle();

          if (existing && existing.device_id !== deviceId) {
            console.log('Device mismatch - logging out');
            logOut('Бу рақам бошқа қурилмада ишлатилмоқда');
            return;
          }
        }

        localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
        console.log('Phone authentication verified successfully');
      } else {
        console.log('Phone authentication failed - logging out');
        logOut('Сизнинг рухсатингиз бекор қилинди');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }, [navigate, toast]);

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

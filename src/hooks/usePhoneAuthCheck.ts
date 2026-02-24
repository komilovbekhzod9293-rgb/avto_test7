import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AUTH_CHECK_INTERVAL = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
const AUTH_TIMESTAMP_KEY = 'phone_auth_timestamp';

export function usePhoneAuthCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkPhoneAuth = useCallback(async () => {
    const phone = localStorage.getItem('phone_number');
    const isAuthenticated = localStorage.getItem('phone_auth') === 'true';

    if (!isAuthenticated || !phone) {
      return;
    }

    console.log('Checking phone authentication...');

    try {
      const response = await fetch('https://n8n.srv1215497.hstgr.cloud/webhook/1f609048-08ae-4a07-9a43-a43960a3854c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await response.json();

      if (data.allowed === 'true' || data.allowed === true) {
        // Update timestamp on successful check
        localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
        console.log('Phone authentication verified successfully');
      } else {
        // Auth failed - log out user
        console.log('Phone authentication failed - logging out');
        localStorage.removeItem('phone_auth');
        localStorage.removeItem('phone_number');
        localStorage.removeItem(AUTH_TIMESTAMP_KEY);
        
        toast({
          title: "Сессия завершена",
          description: "Ваш доступ был отключен. Пожалуйста, войдите снова.",
          variant: "destructive",
        });
        
        navigate('/auth');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On network error, don't log out - just log the error
    }
  }, [navigate, toast]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('phone_auth') === 'true';
    
    if (!isAuthenticated) {
      return;
    }

    // Check if we need to verify immediately (based on last check time)
    const lastCheck = localStorage.getItem(AUTH_TIMESTAMP_KEY);
    const now = Date.now();

    if (!lastCheck) {
      // First time - set timestamp
      localStorage.setItem(AUTH_TIMESTAMP_KEY, now.toString());
    } else {
      const timeSinceLastCheck = now - parseInt(lastCheck, 10);
      
      // If more than 8 hours has passed, check immediately
      if (timeSinceLastCheck >= AUTH_CHECK_INTERVAL) {
        checkPhoneAuth();
      }
    }

    // Set up interval for periodic checks
    const intervalId = setInterval(checkPhoneAuth, AUTH_CHECK_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [checkPhoneAuth]);

  return { checkPhoneAuth };
}

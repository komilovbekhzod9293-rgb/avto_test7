import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';

const authSupabase = createClient(
  "https://ziqzprosgzevkdfwyotl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcXpwcm9zZ3pldmtkZnd5b3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDAwMzAsImV4cCI6MjA4MTkxNjAzMH0.3-4COwffhK2ZU0kU-bnlCWPytsEzRxpMu3SkGg8m7BU"
);

const AUTH_CHECK_INTERVAL = 8 * 60 * 60 * 1000; // 8 часов
const DEVICE_CHECK_INTERVAL = 30 * 1000; // 30 секунд
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

  // Проверка device_id — каждые 30 секунд
  const checkDevice = useCallback(async () => {
    const phone = localStorage.getItem('phone_number');
    const deviceId = localStorage.getItem('device_id');
    const isAuthenticated = localStorage.getItem('phone_auth') === 'true';

    if (!isAuthenticated || !phone || !deviceId) return;

    const { data } = await authSupabase
      .from('allowed_phones')
      .select('device_id')
      .eq('telefon_raqami', phone)
      .maybeSingle();

    if (data && data.device_id !== deviceId) {
      logOut('Сизнинг рақамингиздан бошқа қурилмада кирилди');
    }
  }, [logOut]);

  // Проверка номера в базе — каждые 8 часов
  const checkPhoneAuth = useCallback(async () => {
    const phone = localStorage.getItem('phone_number');
    const isAuthenticated = localStorage.getItem('phone_auth') === 'true';

    if (!isAuthenticated || !phone) return;

    const { data } = await authSupabase
      .from('allowed_phones')
      .select('telefon_raqami')
      .eq('telefon_raqami', phone)
      .maybeSingle();

    if (data) {
      localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
    } else {
      logOut('Сизнинг рухсатингиз бекор қилинди');
    }
  }, [logOut]);

  // Запускаем проверку устройства каждые 30 сек
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('phone_auth') === 'true';
    if (!isAuthenticated) return;

    checkDevice(); // сразу при открытии страницы

    const deviceInterval = setInterval(checkDevice, DEVICE_CHECK_INTERVAL);
    return () => clearInterval(deviceInterval);
  }, [checkDevice]);

  // Запускаем проверку номера каждые 8 часов
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

    const authInterval = setInterval(checkPhoneAuth, AUTH_CHECK_INTERVAL);
    return () => clearInterval(authInterval);
  }, [checkPhoneAuth]);

  return { checkPhoneAuth };
}

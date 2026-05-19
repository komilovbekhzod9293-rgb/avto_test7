import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';
import authBg from '@/assets/auth-bg.jpg';

const authSupabase = createClient(
  "https://ziqzprosgzevkdfwyotl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcXpwcm9zZ3pldmtkZnd5b3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDAwMzAsImV4cCI6MjA4MTkxNjAzMH0.3-4COwffhK2ZU0kU-bnlCWPytsEzRxpMu3SkGg8m7BU"
);

// Получаем или создаём уникальный ID этого браузера/устройства
function getDeviceId(): string {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('device_id', id);
  }
  return id;
}

// Извлекает последние 9 цифр из любого ввода (с +, пробелами, дефисами и т.п.)
function getLast9Digits(input: string): string {
  const digits = (input || '').replace(/\D/g, '');
  return digits.slice(-9);
}

const PhoneAuthPage = () => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const authStatus = localStorage.getItem('phone_auth');
    if (authStatus === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const last9 = getLast9Digits(phone);
    if (!phone.trim() || last9.length < 9) {
      toast({
        title: "Хатолик",
        description: "Телефон рақамини тўғри киритинг (камида 9 рақам)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const deviceId = getDeviceId();

      // 1. Ищем номер в базе по последним 9 цифрам
      const { data: matches, error } = await authSupabase
        .from('allowed_phones')
        .select('telefon_raqami, device_id')
        .ilike('telefon_raqami', `%${last9}`)
        .limit(1);

      if (error) throw error;

      const data = matches && matches.length > 0 ? matches[0] : null;

      if (!data) {
        toast({
          title: "Рухсат берилмади",
          description: "Бу рақам базада топилмади",
          variant: "destructive",
        });
        setPhone('');
        return;
      }

      // 2. Проверяем — привязан ли номер к другому устройству
      if (data.device_id && data.device_id !== deviceId) {
        const confirmed = window.confirm(
          '⚠️ Бу рақам бошқа қурилмада очиқ.\n\nШу қурилмадан кириш учун "OK" босинг.\nАввалги қурилма чиқиб кетади.'
        );
        if (!confirmed) {
          setIsLoading(false);
          return;
        }
      }

      // 3. Обновляем device_id и last_seen в базе
      await authSupabase
        .from('allowed_phones')
        .update({
          device_id: deviceId,
          last_seen: new Date().toISOString(),
        })
        .eq('telefon_raqami', data.telefon_raqami);

      // 4. Сохраняем в localStorage канонический номер из БД
      localStorage.setItem('phone_auth', 'true');
      localStorage.setItem('phone_number', data.telefon_raqami);
      localStorage.setItem('phone_auth_timestamp', Date.now().toString());

      toast({
        title: "Муваффақият",
        description: "Тизимга кирдингиз",
      });

      navigate('/');

    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Хатолик",
        description: "Сервер билан боғланишда хатолик юз берди",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="bg-card/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Тизимга кириш
            </h1>
            <p className="text-muted-foreground">
              ЙҲҚ тестлари платформаси
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Телефон рақамингизни киритинг
              </label>
              <Input
                type="tel"
                inputMode="tel"
                autoComplete="off"
                name="user_phone"
                placeholder="885128080"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-lg h-12"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Текширилмоқда...
                </>
              ) : (
                'Кириш'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PhoneAuthPage;

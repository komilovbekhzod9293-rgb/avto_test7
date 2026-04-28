import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

    if (!phone.trim()) {
      toast({
        title: "Хатолик",
        description: "Телефон рақамингизни киритинг",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // КРИТИЧНО: Используем двойные кавычки для колонки с пробелом
      // Это предотвращает ошибку 404 и неправильную склейку URL
      const { data, error } = await supabase
        .from('allowed_phones')
        .select('"Telefon raqami"') 
        .eq('"Telefon raqami"', phone.trim())
        .maybeSingle();

      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }

      if (data) {
        // Если номер найден в базе
        localStorage.setItem('phone_auth', 'true');
        localStorage.setItem('phone_number', phone.trim());
        localStorage.setItem('phone_auth_timestamp', Date.now().toString());
        
        toast({
          title: "Муваффақият",
          description: "Тизимга кирдингиз",
        });
        
        navigate('/');
      } else {
        // Если номера нет в таблице
        toast({
          title: "Рухсат берилмади",
          description: "Бу рақам базада топилмади",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Full Auth error:', error);
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Телефон рақамингизни киритинг
              </label>
              <Input
                type="tel"
                placeholder="990306405"
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

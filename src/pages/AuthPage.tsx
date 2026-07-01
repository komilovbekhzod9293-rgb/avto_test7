import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Loader2, CheckCircle2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { functionsSupabase } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { migrateLocalProgressToServer, hydrateProgressFromServer } from '@/lib/progress';
import authBg from '@/assets/auth-bg.jpg';

const ERROR_MESSAGES: Record<string, string> = {
  phone_not_allowed: 'Бу телефон рақами базада топилмади',
  phone_already_registered: 'Бу телефон рақами билан аккаунт аллақачон яратилган',
  login_taken: 'Бу логин банд, бошқасини танланг',
  invalid_credentials: 'Логин ёки парол нотўғри',
  access_revoked: 'Сизнинг рухсатингиз бекор қилинди',
  invalid_input: 'Маълумотларни тўғри киритинг',
  phone_not_verified: 'Телефон рақами ҳали тасдиқланмаган',
  verification_expired: 'Тасдиқлаш муддати тугади, қайта уриниб кўринг',
};

function saveSession(user: { id: string; login: string; avatar_url?: string | null }, sessionToken: string) {
  localStorage.setItem('session_token', sessionToken);
  localStorage.setItem('login', user.login);
  localStorage.setItem('user_id', user.id);
  if (user.avatar_url) localStorage.setItem('avatar_url', user.avatar_url);
  else localStorage.removeItem('avatar_url');
}

type RegisterStep = 'phone' | 'verify' | 'credentials';

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registerStep, setRegisterStep] = useState<RegisterStep>('phone');
  const [phone, setPhone] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [botUrl, setBotUrl] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem('session_token')) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const resetRegisterFlow = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setRegisterStep('phone');
    setVerificationId(null);
    setBotUrl(null);
  };

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast({ title: 'Хатолик', description: 'Телефон рақамини киритинг', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await functionsSupabase.functions.invoke('phone-verify', {
        body: { action: 'start', phone },
      });

      const errCode = error ? undefined : data?.error;
      if (error || errCode) {
        toast({
          title: 'Хатолик',
          description: ERROR_MESSAGES[errCode ?? ''] ?? 'Сервер билан боғланишда хатолик юз берди',
          variant: 'destructive',
        });
        return;
      }

      const payload = data.data;
      setVerificationId(payload.verification_id);
      setBotUrl(payload.bot_url);
      setRegisterStep('verify');
      window.open(payload.bot_url, '_blank');

      pollRef.current = setInterval(async () => {
        const { data: statusData } = await functionsSupabase.functions.invoke('phone-verify', {
          body: { action: 'status', verification_id: payload.verification_id },
        });
        const status = statusData?.data;
        if (status?.verified) {
          if (pollRef.current) clearInterval(pollRef.current);
          setRegisterStep('credentials');
        } else if (status?.expired) {
          if (pollRef.current) clearInterval(pollRef.current);
          toast({ title: 'Муддат тугади', description: 'Қайта уриниб кўринг', variant: 'destructive' });
          resetRegisterFlow();
        }
      }, 2000);
    } catch {
      toast({ title: 'Хатолик', description: 'Сервер билан боғланишда хатолик юз берди', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || password.length < 6) {
      toast({ title: 'Хатолик', description: 'Маълумотларни тўғри киритинг (парол камида 6 белги)', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Хатолик', description: 'Пароллар мос келмади', variant: 'destructive' });
      return;
    }
    if (!verificationId) {
      resetRegisterFlow();
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await functionsSupabase.functions.invoke('auth-register', {
        body: { verification_id: verificationId, login: login.trim(), password, device_id: getDeviceId() },
      });

      const errCode = error ? undefined : data?.error;
      if (error || errCode) {
        toast({
          title: 'Хатолик',
          description: ERROR_MESSAGES[errCode ?? ''] ?? 'Сервер билан боғланишда хатолик юз берди',
          variant: 'destructive',
        });
        return;
      }

      const payload = data.data;
      saveSession(payload.user, payload.session_token);
      await migrateLocalProgressToServer();
      await hydrateProgressFromServer();

      toast({ title: 'Муваффақият', description: 'Аккаунт яратилди' });
      navigate('/');
    } catch {
      toast({ title: 'Хатолик', description: 'Сервер билан боғланишда хатолик юз берди', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent, overrideDevice = false) => {
    e.preventDefault();
    if (!login.trim() || !password) {
      toast({ title: 'Хатолик', description: 'Логин ва паролни киритинг', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await functionsSupabase.functions.invoke('auth-login', {
        body: {
          login: login.trim(),
          password,
          device_id: getDeviceId(),
          confirm_device_override: overrideDevice || undefined,
        },
      });

      const errCode = error ? undefined : data?.error;

      if (errCode === 'device_mismatch') {
        const confirmed = window.confirm(
          '⚠️ Бу ҳисоб бошқа қурилмада очиқ.\n\nШу қурилмадан кириш учун "OK" босинг.\nАввалги қурилма чиқиб кетади.'
        );
        if (confirmed) {
          setIsLoading(false);
          await handleLogin(e, true);
        } else {
          setIsLoading(false);
        }
        return;
      }

      if (error || errCode) {
        toast({
          title: 'Хатолик',
          description: ERROR_MESSAGES[errCode ?? ''] ?? 'Сервер билан боғланишда хатолик юз берди',
          variant: 'destructive',
        });
        return;
      }

      const payload = data.data;
      saveSession(payload.user, payload.session_token);
      await hydrateProgressFromServer();

      toast({ title: 'Муваффақият', description: 'Тизимга кирдингиз' });
      navigate('/');
    } catch {
      toast({ title: 'Хатолик', description: 'Сервер билан боғланишда хатолик юз берди', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="bg-card/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {mode === 'login' ? 'Тизимга кириш' : 'Рўйхатдан ўтиш'}
            </h1>
            <p className="text-muted-foreground">ЙҲҚ тестлари платформаси</p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Логин</label>
                <Input
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="text-lg h-12"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Парол</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-lg h-12"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Кириш'}
              </Button>
              <button
                type="button"
                className="w-full text-sm text-muted-foreground underline"
                onClick={() => {
                  setMode('register');
                  resetRegisterFlow();
                }}
              >
                Аккаунтингиз йўқми? Рўйхатдан ўтинг
              </button>
            </form>
          ) : registerStep === 'phone' ? (
            <form onSubmit={handleStartVerification} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Телефон рақамингиз</label>
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="885128080"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-lg h-12"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Давом этиш'}
              </Button>
              <button
                type="button"
                className="w-full text-sm text-muted-foreground underline"
                onClick={() => setMode('login')}
              >
                Аккаунтингиз бор? Киринг
              </button>
            </form>
          ) : registerStep === 'verify' ? (
            <div className="space-y-4 text-center">
              <p className="text-foreground">
                Telegram орқали рақамингизни тасдиқланг. Агар бот очилмаган бўлса — тугмани босинг:
              </p>
              <Button asChild className="w-full h-12 text-lg font-medium">
                <a href={botUrl ?? '#'} target="_blank" rel="noreferrer">
                  <Send className="mr-2 h-5 w-5" />
                  Telegram-ни очиш
                </a>
              </Button>
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Тасдиқлаш кутилмоқда...
              </div>
              <button type="button" className="w-full text-sm text-muted-foreground underline" onClick={resetRegisterFlow}>
                Ортга
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
              <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
                <CheckCircle2 className="h-4 w-4" />
                Телефон рақами тасдиқланди
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Логин ўйлаб топинг</label>
                <Input
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="text-lg h-12"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Парол (камида 6 белги)</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-lg h-12"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Паролни такрорланг</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-lg h-12"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Рўйхатдан ўтиш'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

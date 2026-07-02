import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Loader2, CheckCircle2, Send, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { migrateLocalProgressToServer, hydrateProgressFromServer } from '@/lib/progress';
import { UserCountBadge } from '@/components/UserCountBadge';
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
  phone_not_registered: 'Бу рақам билан аккаунт топилмади',
};

interface AuthUser {
  id: string;
  login: string;
  avatar_url: string | null;
}

function saveSession(user: AuthUser, sessionToken: string) {
  localStorage.setItem('session_token', sessionToken);
  localStorage.setItem('login', user.login);
  localStorage.setItem('user_id', user.id);
  if (user.avatar_url) localStorage.setItem('avatar_url', user.avatar_url);
  else localStorage.removeItem('avatar_url');
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className={`${props.className ?? ''} pr-10`} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

type RegisterStep = 'phone' | 'verify' | 'credentials';
type ResetStep = 'phone' | 'verify' | 'password';

interface PendingVerification {
  verificationId: string;
  botUrl: string;
  // Set once the bot confirms the phone. If the password is still in memory
  // (no reload happened) we finish the login automatically; if a mobile
  // reload wiped it, we ask once for the password instead of re-verifying.
  verified?: boolean;
}

// Mobile browsers (Samsung Internet, Chrome on Android) frequently reload
// the tab when it's backgrounded to open the Telegram app -- all React
// state is lost. Mirror the in-progress verification flow to localStorage
// so a reload can resume exactly where the user left off instead of
// dumping them back on an empty form that looks like "start over".
const FLOW_KEY = 'auth_flow_v1';

interface FlowState {
  mode: 'login' | 'register' | 'reset';
  registerStep: RegisterStep;
  resetStep: ResetStep;
  verificationId: string | null;
  botUrl: string | null;
  phone: string;
  login: string;
  deviceVerification: PendingVerification | null;
}

function saveFlow(state: FlowState) {
  try {
    localStorage.setItem(FLOW_KEY, JSON.stringify(state));
  } catch {
    /* ignore storage errors (private mode, quota, etc.) */
  }
}

function loadFlow(): FlowState | null {
  try {
    const raw = localStorage.getItem(FLOW_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearFlow() {
  localStorage.removeItem(FLOW_KEY);
}

const AuthPage = () => {
  const restored = useRef(loadFlow());
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(restored.current?.mode ?? 'login');
  const [registerStep, setRegisterStep] = useState<RegisterStep>(restored.current?.registerStep ?? 'phone');
  const [resetStep, setResetStep] = useState<ResetStep>(restored.current?.resetStep ?? 'phone');
  const [phone, setPhone] = useState(restored.current?.phone ?? '');
  const [login, setLogin] = useState(restored.current?.login ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(restored.current?.verificationId ?? null);
  const [botUrl, setBotUrl] = useState<string | null>(restored.current?.botUrl ?? null);
  const [deviceVerification, setDeviceVerification] = useState<PendingVerification | null>(
    restored.current?.deviceVerification ?? null,
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Persist on every change so a mid-flow reload can resume.
  useEffect(() => {
    if (mode === 'login' && !deviceVerification) {
      clearFlow();
      return;
    }
    if (mode === 'register' && registerStep === 'phone' && !verificationId) {
      clearFlow();
      return;
    }
    if (mode === 'reset' && resetStep === 'phone' && !verificationId) {
      clearFlow();
      return;
    }
    saveFlow({ mode, registerStep, resetStep, verificationId, botUrl, phone, login, deviceVerification });
  }, [mode, registerStep, resetStep, verificationId, botUrl, phone, login, deviceVerification]);

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

  const showError = (errCode: string | null) => {
    toast({
      title: 'Хатолик',
      description: ERROR_MESSAGES[errCode ?? ''] ?? 'Сервер билан боғланишда хатолик юз берди',
      variant: 'destructive',
    });
  };

  // Shared by both the registration verify step and the device-switch verify
  // step -- checks status immediately (not just after the first 2s tick, so
  // a resumed-after-reload session that was already verified jumps forward
  // right away) then polls every 2s.
  const pollVerification = (
    verifId: string,
    onVerified: (accountLogin: string | null) => void,
    onExpired: () => void,
  ) => {
    if (pollRef.current) clearInterval(pollRef.current);

    const check = async () => {
      const { data: status } = await invokeFunction<{ verified: boolean; expired: boolean; account_login: string | null }>(
        'phone-verify',
        { action: 'status', verification_id: verifId },
      );
      if (status?.verified) {
        if (pollRef.current) clearInterval(pollRef.current);
        onVerified(status.account_login ?? null);
      } else if (status?.expired) {
        if (pollRef.current) clearInterval(pollRef.current);
        onExpired();
      }
    };

    check();
    pollRef.current = setInterval(check, 2000);
  };

  // Resume any in-progress verification after a mount (including a mobile
  // tab reload mid-flow).
  // If the password is still in memory (no reload happened) we can finish
  // login automatically; a mobile reload wipes it, so instead of forcing a
  // second Telegram round-trip we just mark this verified and ask once for
  // the password.
  const handleDeviceVerified = (verifId: string, currentPassword: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (currentPassword) {
      resetDeviceVerification();
      setIsLoading(true);
      attemptLogin(verifId).finally(() => setIsLoading(false));
    } else {
      setDeviceVerification((dv) => (dv ? { ...dv, verified: true } : dv));
    }
  };

  useEffect(() => {
    const urlVerifyId = searchParams.get('verify');

    // The "return to site" link from the bot carries verification_id in the
    // URL -- resolve it directly against the server (via status, which now
    // also returns purpose/account_login) so resuming works even if this is
    // a brand new tab with no localStorage at all.
    if (urlVerifyId) {
      (async () => {
        const { data: status } = await invokeFunction<{
          verified: boolean;
          expired: boolean;
          purpose: 'register' | 'login' | 'reset';
          account_login: string | null;
        }>('phone-verify', { action: 'status', verification_id: urlVerifyId });

        if (!status || status.expired) {
          toast({ title: 'Муддат тугади', description: 'Қайта уриниб кўринг', variant: 'destructive' });
          return;
        }

        if (status.purpose === 'login') {
          setMode('login');
          if (status.account_login) setLogin(status.account_login);
          if (status.verified) {
            setDeviceVerification({ verificationId: urlVerifyId, botUrl: '', verified: true });
          } else {
            setDeviceVerification({ verificationId: urlVerifyId, botUrl: '' });
            pollVerification(
              urlVerifyId,
              () => handleDeviceVerified(urlVerifyId, ''),
              () => {
                toast({ title: 'Муддат тугади', description: 'Қайта уриниб кўринг', variant: 'destructive' });
                resetDeviceVerification();
              },
            );
          }
        } else if (status.purpose === 'reset') {
          setMode('reset');
          setVerificationId(urlVerifyId);
          if (status.account_login) setLogin(status.account_login);
          if (status.verified) {
            setResetStep('password');
          } else {
            setResetStep('verify');
            pollVerification(
              urlVerifyId,
              () => setResetStep('password'),
              () => {
                toast({ title: 'Муддат тугади', description: 'Қайта уриниб кўринг', variant: 'destructive' });
                resetResetFlow();
              },
            );
          }
        } else {
          setMode('register');
          setVerificationId(urlVerifyId);
          if (status.verified) {
            setRegisterStep('credentials');
          } else {
            setRegisterStep('verify');
            pollVerification(
              urlVerifyId,
              () => setRegisterStep('credentials'),
              () => {
                toast({ title: 'Муддат тугади', description: 'Қайта уриниб кўринг', variant: 'destructive' });
                resetRegisterFlow();
              },
            );
          }
        }
      })();
      return;
    }

    if (deviceVerification && !deviceVerification.verified) {
      pollVerification(
        deviceVerification.verificationId,
        () => handleDeviceVerified(deviceVerification.verificationId, password),
        () => {
          toast({ title: 'Муддат тугади', description: 'Қайта уриниб кўринг', variant: 'destructive' });
          resetDeviceVerification();
        },
      );
    } else if (mode === 'register' && registerStep === 'verify' && verificationId) {
      pollVerification(
        verificationId,
        () => setRegisterStep('credentials'),
        () => {
          toast({ title: 'Муддат тугади', description: 'Қайта уриниб кўринг', variant: 'destructive' });
          resetRegisterFlow();
        },
      );
    } else if (mode === 'reset' && resetStep === 'verify' && verificationId) {
      pollVerification(
        verificationId,
        (accountLogin) => {
          if (accountLogin) setLogin(accountLogin);
          setResetStep('password');
        },
        () => {
          toast({ title: 'Муддат тугади', description: 'Қайта уриниб кўринг', variant: 'destructive' });
          resetResetFlow();
        },
      );
    }
    // Only run once on mount to resume a saved flow; new verifications are
    // started explicitly by handleStartVerification / attemptLogin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetRegisterFlow = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setRegisterStep('phone');
    setVerificationId(null);
    setBotUrl(null);
    clearFlow();
  };

  const resetResetFlow = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setResetStep('phone');
    setVerificationId(null);
    setBotUrl(null);
    clearFlow();
  };

  const resetDeviceVerification = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setDeviceVerification(null);
    clearFlow();
  };

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast({ title: 'Хатолик', description: 'Телефон рақамини киритинг', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await invokeFunction<{ verification_id: string; bot_url: string }>('phone-verify', {
        action: 'start',
        phone,
      });

      if (error === 'phone_already_registered') {
        toast({
          title: 'Аккаунт мавжуд',
          description: 'Бу телефон рақами билан аккаунт аллақачон яратилган. Логин ва пароль билан киринг.',
        });
        setMode('login');
        resetRegisterFlow();
        return;
      }

      if (error || !data) {
        showError(error);
        return;
      }

      setVerificationId(data.verification_id);
      setBotUrl(data.bot_url);
      setRegisterStep('verify');
      // Save synchronously before opening Telegram -- on Android, switching
      // to the Telegram app can suspend this page's JS before the React
      // effect that normally persists this state gets a chance to run,
      // which was silently dropping the in-progress verification.
      saveFlow({
        mode: 'register',
        registerStep: 'verify',
        resetStep,
        verificationId: data.verification_id,
        botUrl: data.bot_url,
        phone,
        login,
        deviceVerification: null,
      });
      window.open(data.bot_url, '_blank');

      pollVerification(
        data.verification_id,
        () => setRegisterStep('credentials'),
        () => {
          toast({ title: 'Муддат тугади', description: 'Қайта уриниб кўринг', variant: 'destructive' });
          resetRegisterFlow();
        },
      );
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
      const { data, error } = await invokeFunction<{ user: AuthUser; session_token: string }>('auth-register', {
        verification_id: verificationId,
        login: login.trim(),
        password,
        device_id: getDeviceId(),
      });

      if (error || !data) {
        showError(error);
        // A verification_id that expired (or was somehow never actually
        // confirmed) has no path forward from this screen -- retrying
        // "Register" with it just fails the same way forever. Send the
        // user back to re-verify instead of leaving them stuck with no
        // way out.
        if (error === 'verification_expired' || error === 'phone_not_verified') {
          resetRegisterFlow();
        }
        return;
      }

      clearFlow();
      saveSession(data.user, data.session_token);
      await migrateLocalProgressToServer();
      await hydrateProgressFromServer();

      toast({ title: 'Муваффақият', description: 'Аккаунт яратилди' });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast({ title: 'Хатолик', description: 'Телефон рақамини киритинг', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await invokeFunction<{ verification_id: string; bot_url: string }>('phone-verify', {
        action: 'start_reset',
        phone,
      });

      if (error || !data) {
        showError(error);
        return;
      }

      setVerificationId(data.verification_id);
      setBotUrl(data.bot_url);
      setResetStep('verify');
      // Save synchronously before opening Telegram -- see handleStartVerification.
      saveFlow({
        mode: 'reset',
        registerStep: 'phone',
        resetStep: 'verify',
        verificationId: data.verification_id,
        botUrl: data.bot_url,
        phone,
        login,
        deviceVerification: null,
      });
      window.open(data.bot_url, '_blank');

      pollVerification(
        data.verification_id,
        (accountLogin) => {
          if (accountLogin) setLogin(accountLogin);
          setResetStep('password');
        },
        () => {
          toast({ title: 'Муддат тугади', description: 'Қайта уриниб кўринг', variant: 'destructive' });
          resetResetFlow();
        },
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Хатолик', description: 'Парол камида 6 белгидан иборат бўлиши керак', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Хатолик', description: 'Пароллар мос келмади', variant: 'destructive' });
      return;
    }
    if (!verificationId) {
      resetResetFlow();
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await invokeFunction<{ ok: boolean }>('auth-reset-password', {
        verification_id: verificationId,
        new_password: password,
      });

      if (error || !data) {
        showError(error);
        if (error === 'verification_expired' || error === 'phone_not_verified') {
          resetResetFlow();
        }
        return;
      }

      clearFlow();
      setPassword('');
      setConfirmPassword('');
      setMode('login');
      resetResetFlow();

      toast({ title: 'Муваффақият', description: 'Парол ўзгартирилди. Энди янги парол билан киринг' });
    } finally {
      setIsLoading(false);
    }
  };

  const attemptLogin = async (verifyId?: string) => {
    const { data, error } = await invokeFunction<{
      user: AuthUser;
      session_token: string;
      verification_id?: string;
      bot_url?: string;
    }>('auth-login', {
      login: login.trim(),
      password,
      device_id: getDeviceId(),
      verification_id: verifyId,
    });

    if (error === 'device_mismatch' && data?.verification_id && data?.bot_url) {
      setDeviceVerification({ verificationId: data.verification_id, botUrl: data.bot_url });
      // See handleStartVerification -- persist before opening Telegram so
      // an Android app-switch can't drop this state before React's effect
      // runs.
      saveFlow({
        mode: 'login',
        registerStep: 'phone',
        resetStep: 'phone',
        verificationId: null,
        botUrl: null,
        phone,
        login,
        deviceVerification: { verificationId: data.verification_id, botUrl: data.bot_url },
      });
      window.open(data.bot_url, '_blank');

      pollVerification(
        data.verification_id,
        () => handleDeviceVerified(data.verification_id, password),
        () => {
          toast({ title: 'Муддат тугади', description: 'Қайта уриниб кўринг', variant: 'destructive' });
          resetDeviceVerification();
        },
      );
      return;
    }

    if (error || !data) {
      showError(error);
      return;
    }

    clearFlow();
    saveSession(data.user, data.session_token);
    await hydrateProgressFromServer();

    toast({ title: 'Муваффақият', description: 'Тизимга кирдингиз' });
    navigate('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password) {
      toast({ title: 'Хатолик', description: 'Логин ва паролни киритинг', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await attemptLogin();
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
              {mode === 'login' ? 'Тизимга кириш' : mode === 'reset' ? 'Паролни тиклаш' : 'Рўйхатдан ўтиш'}
            </h1>
            <p className="text-muted-foreground">ЙҲҚ тестлари платформаси</p>
            <div className="mt-3">
              <UserCountBadge />
            </div>
          </div>

          {deviceVerification?.verified ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!password) {
                  toast({ title: 'Хатолик', description: 'Паролни киритинг', variant: 'destructive' });
                  return;
                }
                setIsLoading(true);
                try {
                  await attemptLogin(deviceVerification.verificationId);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="space-y-4"
              autoComplete="off"
            >
              <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
                <CheckCircle2 className="h-4 w-4" />
                Телефон рақами тасдиқланди
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Паролингизни киритинг</label>
                <PasswordInput
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
            </form>
          ) : deviceVerification ? (
            <div className="space-y-4 text-center">
              <p className="text-foreground">
                Бу ҳисоб бошқа қурилмада очиқ. Шу қурилмадан кириш учун телефон рақамингизни Telegram орқали
                тасдиқланг — фақат ҳақиқий эгаси буни қила олади:
              </p>
              <Button asChild className="w-full h-12 text-lg font-medium">
                <a href={deviceVerification.botUrl} target="_blank" rel="noreferrer">
                  <Send className="mr-2 h-5 w-5" />
                  Telegram-ни очиш
                </a>
              </Button>
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Тасдиқлаш кутилмоқда... Telegram-да "Сайтга қайтиш" тугмасини босинг — эски вкладкага қайтманг!
              </div>
              <button
                type="button"
                className="w-full text-sm text-muted-foreground underline"
                onClick={resetDeviceVerification}
              >
                Ортга
              </button>
            </div>
          ) : mode === 'login' ? (
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
                <PasswordInput
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
                  setMode('reset');
                  resetResetFlow();
                }}
              >
                Паролни унутдингизми?
              </button>
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
          ) : mode === 'reset' && resetStep === 'phone' ? (
            <form onSubmit={handleStartReset} className="space-y-4" autoComplete="off">
              <p className="text-sm text-muted-foreground text-center">
                Рўйхатдан ўтишда кўрсатган телефон рақамингизни киритинг — логинингизни эслаб қолиш шарт эмас,
                бот ўзи топади.
              </p>
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
                Ортга
              </button>
            </form>
          ) : mode === 'reset' && resetStep === 'verify' ? (
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
                Тасдиқлаш кутилмоқда... Telegram-да "Сайтга қайтиш" тугмасини босинг — эски вкладкага қайтманг!
              </div>
              <button type="button" className="w-full text-sm text-muted-foreground underline" onClick={resetResetFlow}>
                Ортга
              </button>
            </div>
          ) : mode === 'reset' && resetStep === 'password' ? (
            <form onSubmit={handleResetPassword} className="space-y-4" autoComplete="off">
              <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
                <CheckCircle2 className="h-4 w-4" />
                Телефон рақами тасдиқланди
              </div>
              {login && (
                <p className="text-center text-foreground">
                  Логинингиз: <span className="font-semibold">{login}</span>
                </p>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Янги парол (камида 6 белги)</label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-lg h-12"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Янги паролни такрорланг</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-lg h-12"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Паролни ўзгартириш'}
              </Button>
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
                Тасдиқлаш кутилмоқда... Telegram-да "Сайтга қайтиш" тугмасини босинг — эски вкладкага қайтманг!
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
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-lg h-12"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Паролни такрорланг</label>
                <PasswordInput
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

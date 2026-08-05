import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useAccessInfo, useFullAccess } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { TariffCheckoutDialog } from '@/components/TariffCheckoutDialog';
import { useT } from '@/hooks/useT';
import { getTestLang } from '@/lib/testLang';

const TARIFF_LABELS: Record<string, string> = {
  standard: 'Стандарт',
  pro: 'Про',
  max: 'Макс',
};

// Supabase timestamps are UTC -- always format with an explicit timeZone so
// students see Tashkent time (UTC+5), not the server's raw UTC hour.
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Asia/Tashkent',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatRemaining(ms: number, isRu: boolean): string {
  if (ms <= 0) return isRu ? 'истёк' : 'муддати тугади';
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(isRu ? `${days} дн` : `${days} кун`);
  if (hours > 0 || days > 0) parts.push(isRu ? `${hours} ч` : `${hours} соат`);
  parts.push(isRu ? `${minutes} мин` : `${minutes} дақиқа`);
  return parts.join(' ');
}

/** Paid users see a neutral countdown to renewal; trial users see an urgent countdown to their 7-day cutoff (with a buy CTA); everyone else (permanent manual grants, shared lab accounts) sees nothing. */
export function AccessExpiryBadge({ className = '' }: { className?: string }) {
  const fullAccess = useFullAccess();
  const { tariff, expiresAt, trialExpiresAt } = useAccessInfo();
  const [now, setNow] = useState(() => Date.now());
  const t = useT();
  const isRu = getTestLang() === 'ru';

  const trackedAt = fullAccess ? expiresAt : trialExpiresAt;

  useEffect(() => {
    if (!trackedAt) return;
    const interval = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(interval);
  }, [trackedAt]);

  if (!trackedAt) return null;

  const targetMs = new Date(trackedAt).getTime();
  const remainingMs = targetMs - now;

  if (!fullAccess) {
    // Trial countdown: always urgent-styled (not just <24h like the paid
    // badge) -- the whole point is visible pressure for all 7 days, not
    // just the last one.
    return (
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm ${className}`}>
        <Clock className="w-3.5 h-3.5 shrink-0 text-destructive" />
        <span className="text-foreground">
          {t('Синов муддати', 'Пробный период')}
          {' · '}
          <span className="font-bold text-destructive tabular-nums">{formatRemaining(remainingMs, isRu)}</span>
        </span>
        <TariffCheckoutDialog
          trigger={
            <Button size="sm" className="h-6 px-2.5 rounded-full text-xs font-bold">
              {t('Тўлиқ доступ', 'Полный доступ')}
            </Button>
          }
        />
      </div>
    );
  }

  const tariffLabel = tariff ? (TARIFF_LABELS[tariff] ?? tariff) : null;

  return (
    <div className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm text-muted-foreground ${className}`}>
      <Clock className="w-3.5 h-3.5 shrink-0" />
      <span>
        {tariffLabel ? `Тариф ${tariffLabel} — ` : ''}
        {isRu ? `до ${dateFormatter.format(targetMs)}` : `${dateFormatter.format(targetMs)} гача`}
        {' · '}
        <span className={remainingMs <= 24 * 60 * 60 * 1000 ? 'font-semibold text-destructive' : 'font-semibold text-foreground'}>
          {formatRemaining(remainingMs, isRu)}
        </span>
      </span>
      <TariffCheckoutDialog
        defaultTariff={tariff as 'standard' | 'pro' | 'max' | null}
        trigger={
          <Button size="sm" variant="outline" className="h-6 px-2.5 rounded-full text-xs font-bold">
            {t('Узайтириш', 'Продлить')}
          </Button>
        }
      />
    </div>
  );
}

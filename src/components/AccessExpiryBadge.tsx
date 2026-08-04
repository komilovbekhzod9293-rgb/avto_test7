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

/** Renders nothing for trial users and permanent (manual, no-expiry) grants -- only shows for a real tracked paid expiry. */
export function AccessExpiryBadge({ className = '' }: { className?: string }) {
  const fullAccess = useFullAccess();
  const { tariff, expiresAt } = useAccessInfo();
  const [now, setNow] = useState(() => Date.now());
  const t = useT();
  const isRu = getTestLang() === 'ru';

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!fullAccess || !expiresAt) return null;

  const expiresAtMs = new Date(expiresAt).getTime();
  const remainingMs = expiresAtMs - now;
  const tariffLabel = tariff ? (TARIFF_LABELS[tariff] ?? tariff) : null;

  return (
    <div className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm text-muted-foreground ${className}`}>
      <Clock className="w-3.5 h-3.5 shrink-0" />
      <span>
        {tariffLabel ? `Тариф ${tariffLabel} — ` : ''}
        {isRu ? `до ${dateFormatter.format(expiresAtMs)}` : `${dateFormatter.format(expiresAtMs)} гача`}
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

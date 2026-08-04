import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageShell } from '@/components/PageShell';
import { useToast } from '@/hooks/use-toast';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { safeStorage } from '@/lib/safeStorage';
import { TARIFF_IDS, type TariffId } from '@/lib/pendingTariff';
import { TARIFF_DISPLAY } from '@/lib/tariffs';
import { cn } from '@/lib/utils';
import { useT } from '@/hooks/useT';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const tariffParam = searchParams.get('tariff');
  const initialTariff: TariffId = TARIFF_IDS.includes(tariffParam as TariffId) ? (tariffParam as TariffId) : 'standard';
  const [tariff, setTariff] = useState<TariffId>(initialTariff);
  const plan = TARIFF_DISPLAY[tariff];

  const [firstName, setFirstName] = useState(safeStorage.getItem('checkout_first_name') ?? '');
  const [lastName, setLastName] = useState(safeStorage.getItem('checkout_last_name') ?? '');
  const [submitting, setSubmitting] = useState(false);
  const t = useT();

  const handlePay = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: t('Хатолик', 'Ошибка'), description: t('Исм ва фамилияни киритинг', 'Введите имя и фамилию'), variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      safeStorage.setItem('checkout_first_name', firstName.trim());
      safeStorage.setItem('checkout_last_name', lastName.trim());

      const { data, error } = await invokeFunction<{ checkout_url: string }>('payment-create-invoice', {
        session_token: safeStorage.getItem('session_token'),
        device_id: getDeviceId(),
        tariff,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      if (error || !data) {
        toast({ title: t('Хатолик', 'Ошибка'), description: t('Тўловни бошлаб бўлмади, кейинроқ уриниб кўринг', 'Не удалось начать оплату, попробуйте позже'), variant: 'destructive' });
        return;
      }

      window.location.href = data.checkout_url;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title={t('Тўлов', 'Оплата')}>
      <div className="glass-card rounded-3xl p-6 mb-5 max-w-md mx-auto">
        <h2 className="font-bold text-foreground mb-4 font-display">{t('Тарифни танланг', 'Выберите тариф')}</h2>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {TARIFF_IDS.map((id) => {
            const display = TARIFF_DISPLAY[id];
            const isSelected = tariff === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTariff(id)}
                disabled={submitting}
                className={cn(
                  'relative rounded-2xl border-2 p-3 text-left transition-colors',
                  isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/40',
                )}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
                  </span>
                )}
                <p className="text-xs font-bold text-foreground">{display.name.replace('Тариф ', '')}</p>
                <p className="text-sm font-black text-foreground tabular-nums mt-1">{display.priceSum.toLocaleString('ru-RU')}</p>
                <p className="text-[11px] text-muted-foreground">{display.durationDays} {t('кун', 'дн.')}</p>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="checkout-first-name">{t('Исм', 'Имя')}</Label>
            <Input id="checkout-first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={submitting} />
          </div>
          <div>
            <Label htmlFor="checkout-last-name">{t('Фамилия', 'Фамилия')}</Label>
            <Input id="checkout-last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={submitting} />
          </div>

          <Button className="w-full rounded-full font-bold" disabled={submitting} onClick={handlePay}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {plan.priceSum.toLocaleString('ru-RU')} {t('сум тўлаш', 'сум оплатить')}
          </Button>
          <Button variant="ghost" className="w-full" disabled={submitting} onClick={() => navigate('/')}>
            {t('Бекор қилиш', 'Отмена')}
          </Button>
        </div>
      </div>
    </PageShell>
  );
};

export default CheckoutPage;

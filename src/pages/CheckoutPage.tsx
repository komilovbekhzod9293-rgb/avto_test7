import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const tariffParam = searchParams.get('tariff');
  const tariff: TariffId = TARIFF_IDS.includes(tariffParam as TariffId) ? (tariffParam as TariffId) : 'standard';
  const plan = TARIFF_DISPLAY[tariff];

  const [firstName, setFirstName] = useState(safeStorage.getItem('checkout_first_name') ?? '');
  const [lastName, setLastName] = useState(safeStorage.getItem('checkout_last_name') ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: 'Хатолик', description: 'Исм ва фамилияни киритинг', variant: 'destructive' });
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
        toast({ title: 'Хатолик', description: 'Тўловни бошлаб бўлмади, кейинроқ уриниб кўринг', variant: 'destructive' });
        return;
      }

      window.location.href = data.checkout_url;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="Тўлов">
      <div className="glass-card rounded-3xl p-6 mb-5 max-w-md mx-auto">
        <h2 className="font-bold text-foreground mb-1 font-display">{plan.name}</h2>
        <p className="text-2xl font-black text-foreground mb-1">{plan.priceSum.toLocaleString('ru-RU')} сум</p>
        <p className="text-sm text-muted-foreground mb-6">{plan.durationDays} кунга</p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="checkout-first-name">Исм</Label>
            <Input id="checkout-first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={submitting} />
          </div>
          <div>
            <Label htmlFor="checkout-last-name">Фамилия</Label>
            <Input id="checkout-last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={submitting} />
          </div>

          <Button className="w-full rounded-full font-bold" disabled={submitting} onClick={handlePay}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Тўлаш
          </Button>
          <Button variant="ghost" className="w-full" disabled={submitting} onClick={() => navigate('/')}>
            Бекор қилиш
          </Button>
        </div>
      </div>
    </PageShell>
  );
};

export default CheckoutPage;

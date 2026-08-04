import { useState, type ReactNode } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { safeStorage } from '@/lib/safeStorage';
import { useTestLang } from '@/hooks/useTestLang';
import { useT } from '@/hooks/useT';
import { LANDING_DICTS } from '@/lib/i18n';
import { TARIFF_IDS, type TariffId } from '@/lib/pendingTariff';
import { cn } from '@/lib/utils';

// In-app equivalent of the landing page's Pricing section -- same copy
// (LANDING_DICTS, single source of truth) and the same card look, but as a
// dialog so buying/renewing never leaves the study app or bounces the
// student back to the marketing landing page. Follows the app's own
// test_lang (not landing_lang) so it stays in sync with the app header.
export function TariffCheckoutDialog({ trigger, defaultTariff }: { trigger: ReactNode; defaultTariff?: TariffId | null }) {
  const [testLang] = useTestLang();
  const t = LANDING_DICTS[testLang];
  const tt = useT();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [tariff, setTariff] = useState<TariffId>(defaultTariff ?? 'pro');
  const [firstName, setFirstName] = useState(safeStorage.getItem('checkout_first_name') ?? '');
  const [lastName, setLastName] = useState(safeStorage.getItem('checkout_last_name') ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setTariff(defaultTariff ?? 'pro');
  };

  const handlePay = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: tt('Хатолик', 'Ошибка'), description: tt('Исм ва фамилияни киритинг', 'Введите имя и фамилию'), variant: 'destructive' });
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
        toast({ title: tt('Хатолик', 'Ошибка'), description: tt('Тўловни бошлаб бўлмади, кейинроқ уриниб кўринг', 'Не удалось начать оплату, попробуйте позже'), variant: 'destructive' });
        return;
      }

      window.location.href = data.checkout_url;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t.pricing.title}</DialogTitle>
        </DialogHeader>

        <div className="grid sm:grid-cols-3 gap-4 items-stretch mt-2">
          {t.pricing.plans.map((plan, i) => {
            const id = TARIFF_IDS[i] ?? 'standard';
            const isSelected = tariff === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTariff(id)}
                disabled={submitting}
                className={cn(
                  'text-left rounded-3xl p-5 flex flex-col h-full relative overflow-hidden glass-card transition-all',
                  isSelected ? 'ring-2 ring-primary' : 'ring-1 ring-transparent hover:ring-primary/30',
                )}
              >
                <div className="relative h-6 mb-2 flex items-center gap-2">
                  {plan.highlight && (
                    <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-primary-foreground font-mono">
                      Popular
                    </span>
                  )}
                  {isSelected && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{plan.desc}</p>
                <p className="text-xl font-bold text-foreground mb-4 font-display tabular-nums">{plan.price}</p>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-0.5 w-3.5 h-3.5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-success" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                  {plan.excluded?.map((f, fi) => (
                    <li key={`x-${fi}`} className="flex items-start gap-2 text-xs text-muted-foreground/60">
                      <span className="mt-0.5 w-3.5 h-3.5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                        <X className="w-2.5 h-2.5 text-destructive" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div>
            <Label htmlFor="tariff-dialog-first-name">{tt('Исм', 'Имя')}</Label>
            <Input id="tariff-dialog-first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={submitting} />
          </div>
          <div>
            <Label htmlFor="tariff-dialog-last-name">{tt('Фамилия', 'Фамилия')}</Label>
            <Input id="tariff-dialog-last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={submitting} />
          </div>
        </div>

        <Button className="w-full rounded-full font-bold mt-2" disabled={submitting} onClick={handlePay}>
          {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {t.pricing.cta}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

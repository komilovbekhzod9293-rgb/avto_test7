import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LandingDict } from '@/lib/i18n';

export function Pricing({ t, onSelect }: { t: LandingDict; onSelect: () => void }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3">{t.pricing.title}</h2>
          <p className="text-muted-foreground text-lg">{t.pricing.subtitle}</p>
        </div>
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-success/15 text-success px-4 py-1.5 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            {t.pricing.freeBadge}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.pricing.plans.map((plan, i) => (
            <div
              key={i}
              className={cn(
                'rounded-2xl p-6 flex flex-col',
                plan.highlight ? 'glass-strong border-2 border-primary' : 'glass'
              )}
            >
              {plan.highlight && (
                <span className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">Popular</span>
              )}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
              <p className="text-2xl font-black text-foreground mb-4">{plan.price}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={onSelect}
                variant={plan.highlight ? 'default' : 'outline'}
                className="w-full font-semibold"
              >
                {t.pricing.cta}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">{t.pricing.onlineNote}</p>
      </div>
    </section>
  );
}

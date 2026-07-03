import { Check, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LandingDict } from '@/lib/i18n';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

export function Pricing({ t, onSelect }: { t: LandingDict; onSelect: () => void }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Pricing" title={t.pricing.title} subtitle={t.pricing.subtitle} />

        <Reveal className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-success/12 text-success px-4 py-2 text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            {t.pricing.freeBadge}
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {t.pricing.plans.map((plan, i) => (
            <Reveal key={i} delay={i * 70} className={cn(plan.highlight && 'lg:-mt-4 lg:mb-0')}>
              <div
                className={cn(
                  'rounded-3xl p-6 flex flex-col h-full relative overflow-hidden',
                  plan.highlight ? 'glass-card glow-soft ring-1 ring-primary/40' : 'glass-card',
                )}
              >
                {plan.highlight && (
                  <>
                    <div className="absolute inset-x-0 -top-24 h-40 bg-primary/20 blur-3xl" />
                    <span className="relative inline-flex items-center gap-1 self-start rounded-full bg-primary px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-primary-foreground mb-3">
                      Popular
                    </span>
                  </>
                )}
                <h3 className="relative text-xl font-extrabold text-foreground font-display">{plan.name}</h3>
                <p className="relative text-sm text-muted-foreground mb-5">{plan.desc}</p>
                <p className="relative text-[1.75rem] font-black text-foreground mb-5 leading-none font-display tabular-nums">
                  {plan.price}
                </p>
                <ul className="relative space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-success" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={onSelect}
                  variant={plan.highlight ? 'default' : 'outline'}
                  className={cn('relative w-full font-bold rounded-full', plan.highlight ? 'shadow-md' : 'bg-card border-border')}
                >
                  {t.pricing.cta}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="flex items-start gap-2.5 text-sm text-muted-foreground mt-10 max-w-2xl mx-auto text-center justify-center">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>{t.pricing.onlineNote}</span>
        </Reveal>
      </div>
    </section>
  );
}

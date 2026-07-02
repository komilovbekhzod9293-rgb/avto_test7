import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatRing } from './StatRing';
import type { LandingDict } from '@/lib/i18n';

export function Hero({ t, onFreeLesson, onRegister }: { t: LandingDict; onFreeLesson: () => void; onRegister: () => void }) {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 px-4">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, hsl(var(--primary) / 0.25), transparent 70%)',
        }}
      />
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            {t.hero.badge}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground text-balance leading-[1.05] mb-6">
            {t.hero.title} <span className="text-primary">{t.hero.titleHighlight}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-8 text-balance">{t.hero.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={onFreeLesson} className="h-12 px-6 text-base font-semibold">
              {t.hero.ctaPrimary}
            </Button>
            <Button size="lg" variant="outline" onClick={onRegister} className="h-12 px-6 text-base font-semibold">
              {t.hero.ctaSecondary}
            </Button>
          </div>
        </div>
        <StatRing />
      </div>
    </section>
  );
}

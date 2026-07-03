import { ArrowRight, Play, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppShowcase } from './AppShowcase';
import { SplitText } from './SplitText';
import type { LandingDict } from '@/lib/i18n';

export function Hero({ t, onFreeLesson, onRegister }: { t: LandingDict; onFreeLesson: () => void; onRegister: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden pt-32 sm:pt-36 pb-20 px-4">
      {/* base wash: white -> #F6F8FD */}
      <div className="absolute inset-0 -z-30 pointer-events-none" style={{ background: 'linear-gradient(180deg, #FFFFFF, #F6F8FD 60%)' }} />
      {/* breathing blue glow around the phone (right side) */}
      <div
        className="bg-breathe absolute -z-20 pointer-events-none rounded-full"
        style={{
          width: '46rem', height: '46rem', right: '-6%', top: '-6%',
          background: 'radial-gradient(circle at 50% 50%, rgba(37,93,255,0.14), transparent 62%)',
        }}
      />
      {/* giant, barely-there "7" — felt, not read */}
      <span
        aria-hidden
        className="font-display pointer-events-none select-none absolute -z-10 leading-none"
        style={{
          right: '1%', top: '4%', fontSize: 'clamp(240px, 46vw, 580px)',
          color: 'rgba(37,93,255,0.05)', letterSpacing: '-0.06em',
        }}
      >
        7
      </span>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-8 items-center">
        <div>
          <div className="inline-flex max-w-full items-center gap-2 glass rounded-full pl-1.5 pr-3.5 py-1.5 mb-7 text-sm font-medium text-foreground reveal reveal-show">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-primary font-mono font-semibold shrink-0 tabular-nums">
              <Star className="w-3.5 h-3.5 fill-primary" /> 4.9
            </span>
            <span className="text-muted-foreground truncate min-w-0">{t.hero.badge}</span>
          </div>

          <h1 className="font-display font-extrabold tracking-tightest text-[clamp(2.6rem,7vw,4.75rem)] leading-[0.98] mb-6">
            <SplitText
              as="span"
              text={t.hero.title}
              trigger="mount"
              stagger={70}
              className="text-foreground"
            />{' '}
            <SplitText
              as="span"
              text={t.hero.titleHighlight}
              trigger="mount"
              delay={t.hero.title.split(' ').length * 70 + 120}
              stagger={70}
              wordClassName="text-gradient-primary"
            />
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-9 text-pretty leading-relaxed reveal reveal-show" style={{ animationDelay: '650ms' }}>
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap gap-3.5 reveal reveal-show" style={{ animationDelay: '800ms' }}>
            <Button
              size="lg"
              onClick={onFreeLesson}
              className="cta-primary group h-13 px-7 text-base font-bold rounded-full"
              style={{ height: '3.25rem' }}
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              {t.hero.ctaPrimary}
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onRegister}
              className="h-13 px-7 text-base font-bold rounded-full bg-card border-border"
              style={{ height: '3.25rem' }}
            >
              {t.hero.ctaSecondary}
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground reveal reveal-show" style={{ animationDelay: '950ms' }}>
            <ShieldCheck className="w-4 h-4 text-success" />
            {t.pricing.freeBadge}
          </div>
        </div>

        <AppShowcase t={t} />
      </div>
    </section>
  );
}

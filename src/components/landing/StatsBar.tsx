import type { LandingDict } from '@/lib/i18n';
import { Reveal } from './Reveal';

export function StatsBar({ t }: { t: LandingDict }) {
  const items = [
    { value: '12 000+', label: t.stats.graduates },
    { value: '95%', label: t.stats.passRate },
    { value: '1300+', label: t.stats.questions },
    { value: '7', label: t.stats.days },
  ];

  return (
    <section className="px-4 relative z-10 -mt-4">
      <Reveal className="max-w-5xl mx-auto glass-card rounded-3xl grid grid-cols-2 sm:grid-cols-4 overflow-hidden">
        {items.map((item, i) => (
          <div
            key={i}
            className="p-6 text-center border-border/40 [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0 [&:not(:nth-child(2n+1))]:border-l sm:[&:not(:first-child)]:border-l"
          >
            <p className="text-3xl sm:text-4xl font-black text-gradient-primary font-display tabular-nums">{item.value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">{item.label}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

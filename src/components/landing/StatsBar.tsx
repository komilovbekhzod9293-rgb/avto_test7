import type { LandingDict } from '@/lib/i18n';

export function StatsBar({ t }: { t: LandingDict }) {
  const items = [
    { value: '12 000+', label: t.stats.graduates },
    { value: '95%', label: t.stats.passRate },
    { value: '1300+', label: t.stats.questions },
    { value: '7', label: t.stats.days },
  ];

  return (
    <section className="px-4 -mt-6 relative z-10">
      <div className="max-w-5xl mx-auto glass rounded-2xl grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/50 overflow-hidden">
        {items.map((item, i) => (
          <div key={i} className="p-5 text-center">
            <p className="text-2xl sm:text-3xl font-black text-primary">{item.value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

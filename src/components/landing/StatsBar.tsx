import type { LandingDict } from '@/lib/i18n';

export function StatsBar({ t }: { t: LandingDict }) {
  const items = [
    { value: '12 000+', label: t.stats.graduates, tone: 'text-white' },
    { value: '95%', label: t.stats.passRate, tone: 'text-[#34D399]' },
    { value: '1300+', label: t.stats.questions, tone: 'text-white' },
    { value: '7', label: t.stats.days, tone: 'text-[#5B87FF]' },
  ];

  return (
    <section className="px-4 relative z-10 -mt-6">
      {/* dark premium card — the "expensive" contrast against the light page */}
      <div
        className="reveal reveal-show max-w-5xl mx-auto rounded-[32px] grid grid-cols-2 sm:grid-cols-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #111827, #0F172A)', boxShadow: '0 40px 80px -30px rgba(15,23,42,0.45)' }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="px-6 py-8 text-center border-white/10 [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0 [&:not(:nth-child(2n+1))]:border-l sm:[&:not(:first-child)]:border-l"
          >
            <p className={`text-3xl sm:text-4xl font-bold font-mono tabular-nums ${item.tone}`}>{item.value}</p>
            <p className="label-mono text-[10px] sm:text-[11px] text-white/45 mt-2.5">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

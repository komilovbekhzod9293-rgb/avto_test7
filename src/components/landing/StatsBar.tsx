import { useEffect, useRef, useState } from 'react';
import type { LandingDict } from '@/lib/i18n';

function useCountUp(target: number, active: boolean, durationMs = 1600) {
  const [v, setV] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, active, durationMs]);
  return v;
}

function Stat({ target, active, suffix, group, tone, label }: {
  target: number; active: boolean; suffix: string; group: boolean; tone: string; label: string;
}) {
  const v = useCountUp(target, active);
  const num = group ? v.toLocaleString('ru-RU') : String(v);
  return (
    <div className="px-6 py-8 text-center border-white/10 [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0 [&:not(:nth-child(2n+1))]:border-l sm:[&:not(:first-child)]:border-l">
      <p className={`text-3xl sm:text-4xl font-bold font-mono tabular-nums ${tone}`}>{num}{suffix}</p>
      <p className="label-mono text-[10px] sm:text-[11px] text-white/45 mt-2.5">{label}</p>
    </div>
  );
}

export function StatsBar({ t }: { t: LandingDict }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setActive(true);
      return;
    }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setActive(true); obs.disconnect(); }
    }, { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="px-4 relative z-10 -mt-6">
      {/* dark premium card — the "expensive" contrast against the light page */}
      <div
        ref={ref}
        className={`reveal ${active ? 'reveal-show' : ''} max-w-5xl mx-auto rounded-[32px] grid grid-cols-2 sm:grid-cols-4 overflow-hidden`}
        style={{ background: 'linear-gradient(135deg, #111827, #0F172A)', boxShadow: '0 40px 80px -30px rgba(15,23,42,0.45)' }}
      >
        <Stat target={12000} active={active} suffix="+" group tone="text-white" label={t.stats.graduates} />
        <Stat target={95} active={active} suffix="%" group={false} tone="text-[#34D399]" label={t.stats.passRate} />
        <Stat target={1300} active={active} suffix="+" group={false} tone="text-white" label={t.stats.questions} />
        {/* 7 stays static — too small to animate */}
        <div className="px-6 py-8 text-center border-white/10 [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0 [&:not(:nth-child(2n+1))]:border-l sm:[&:not(:first-child)]:border-l">
          <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-[#5B87FF]">7</p>
          <p className="label-mono text-[10px] sm:text-[11px] text-white/45 mt-2.5">{t.stats.days}</p>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import type { LandingDict } from '@/lib/i18n';

interface RingStat {
  value: number;
  suffix: string;
  label: string;
}

function useCountUp(target: number, active: boolean, durationMs = 1800) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, target]);

  return value;
}

function RingNumber({ stat, active, angle, label }: { stat: RingStat; active: boolean; angle: number; label: string }) {
  const value = useCountUp(stat.value, active);
  return (
    <div
      className="absolute top-1/2 left-1/2"
      style={{
        transform: `rotate(${angle}deg) translate(0, clamp(-14rem, -33vw, -9.5rem)) rotate(${-angle}deg) translate(-50%, -50%)`,
      }}
    >
      <div className="glass-card rounded-2xl px-4 py-2.5 text-center min-w-[6.5rem]">
        <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums leading-none font-display">
          {value.toLocaleString('ru-RU')}
          <span className="text-primary">{stat.suffix}</span>
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">{label}</p>
      </div>
    </div>
  );
}

// iPhone-camera-zoom-style dial: layered rotating rings + tick marks,
// with the key numbers "spinning up" as boxes orbiting the core.
export function StatRing({ t }: { t: LandingDict }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const STATS: RingStat[] = [
    { value: 12000, suffix: '+', label: '' },
    { value: 95, suffix: '%', label: '' },
    { value: 1300, suffix: '+', label: '' },
    { value: 7, suffix: '', label: '' },
  ];
  const LABELS = [t.stats.graduates, t.stats.passRate, t.stats.questions, t.stats.days];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dial = { width: 'clamp(15rem, 62vw, 23rem)', height: 'clamp(15rem, 62vw, 23rem)' } as const;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[24rem] sm:h-[30rem] flex items-center justify-center select-none overflow-visible"
    >
      {/* glow behind the dial */}
      <div
        className="absolute rounded-full blur-3xl opacity-40"
        style={{ width: '60%', height: '60%', background: 'radial-gradient(circle, hsl(var(--primary) / 0.7), transparent 70%)' }}
      />

      {/* outer tick ring, slow spin */}
      <div className="absolute rounded-full border border-primary/15 animate-spin-slow" style={dial}>
        {Array.from({ length: 60 }).map((_, i) => (
          <span
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{
              width: i % 5 === 0 ? '2px' : '1px',
              height: i % 5 === 0 ? '16px' : '8px',
              background: i % 5 === 0 ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--foreground) / 0.25)',
              transform: `rotate(${i * 6}deg) translateY(clamp(-7.5rem, -31vw, -11.5rem))`,
              transformOrigin: 'center',
            }}
          />
        ))}
      </div>

      {/* inner dashed ring, reverse spin */}
      <div className="absolute rounded-full border border-dashed border-primary/10 animate-spin-rev" style={{ width: 'clamp(11rem, 46vw, 17rem)', height: 'clamp(11rem, 46vw, 17rem)' }} />

      {/* core */}
      <div className="glass-card w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center text-center z-10 glow-primary">
        <div>
          <p className="text-3xl sm:text-4xl font-black text-gradient-primary font-display leading-none">AT7</p>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">avtotest</p>
        </div>
      </div>

      {STATS.map((stat, i) => (
        <RingNumber key={i} stat={stat} active={active} angle={i * 90 - 45} label={LABELS[i]} />
      ))}
    </div>
  );
}

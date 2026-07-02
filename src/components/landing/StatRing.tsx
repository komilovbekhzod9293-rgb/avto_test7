import { useEffect, useRef, useState } from 'react';

interface RingStat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: RingStat[] = [
  { value: 12000, suffix: '+', label: '' },
  { value: 95, suffix: '%', label: '' },
  { value: 1300, suffix: '+', label: '' },
  { value: 7, suffix: '', label: '' },
];

function useCountUp(target: number, active: boolean, durationMs = 1600) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
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

function RingNumber({ stat, active, angle }: { stat: RingStat; active: boolean; angle: number }) {
  const value = useCountUp(stat.value, active);
  return (
    <div
      className="absolute top-1/2 left-1/2 flex flex-col items-center"
      style={{
        transform: `rotate(${angle}deg) translate(0, clamp(-13rem, -30vw, -8.5rem)) rotate(${-angle}deg) translate(-50%, -50%)`,
      }}
    >
      <div className="glass-strong rounded-2xl px-5 py-3 text-center shadow-xl">
        <p className="text-2xl sm:text-3xl font-black text-foreground tabular-nums">
          {value.toLocaleString('ru-RU')}
          {stat.suffix}
        </p>
      </div>
    </div>
  );
}

export function StatRing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

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

  return (
    <div ref={containerRef} className="relative w-full h-[22rem] sm:h-[26rem] flex items-center justify-center select-none overflow-visible">
      {/* Slowly rotating decorative ring, like a camera zoom / compass dial. */}
      <div
        className="absolute rounded-full border border-primary/20"
        style={{ width: 'clamp(14rem, 60vw, 22rem)', height: 'clamp(14rem, 60vw, 22rem)', animation: 'spin 40s linear infinite' }}
      >
        {Array.from({ length: 36 }).map((_, i) => (
          <span
            key={i}
            className="absolute top-1/2 left-1/2 w-px bg-primary/25"
            style={{
              height: i % 3 === 0 ? '14px' : '7px',
              transform: `rotate(${i * 10}deg) translateY(clamp(-7rem, -30vw, -11rem))`,
            }}
          />
        ))}
      </div>
      <div
        className="absolute rounded-full border border-dashed border-primary/10"
        style={{ width: 'clamp(14rem, 60vw, 22rem)', height: 'clamp(14rem, 60vw, 22rem)', animation: 'spin-reverse 60s linear infinite' }}
      />

      <div className="glass-strong w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center text-center shadow-2xl z-10">
        <div>
          <p className="text-3xl sm:text-4xl font-black text-primary">AT7</p>
        </div>
      </div>

      {STATS.map((stat, i) => (
        <RingNumber key={i} stat={stat} active={active} angle={i * 90 - 45} />
      ))}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      `}</style>
    </div>
  );
}

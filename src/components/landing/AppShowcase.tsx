import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Users, Timer, Trophy } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';
import { Logo } from './Logo';

function useCountUp(target: number, active: boolean, durationMs = 1900) {
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

// Premium hero visual: a floating device showing the actual product (a PDD
// question being solved), ringed by glass stat chips that drift and count up.
export function AppShowcase({ t }: { t: LandingDict }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setActive(true), { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const grads = useCountUp(12000, active);
  const pass = useCountUp(95, active);

  const options = [
    { label: 'Ҳаракатланиш тақиқланган', ok: false },
    { label: 'Тўхташ мумкин эмас', ok: true },
    { label: 'Айланма ҳаракат', ok: false },
    { label: 'Асосий йўл', ok: false },
  ];

  return (
    <div ref={ref} className="relative w-full flex items-center justify-center py-6">
      {/* ambient glow */}
      <div className="absolute w-[70%] h-[70%] rounded-full blur-3xl opacity-40"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.6), transparent 70%)' }} />

      {/* device — reveal on outer, float on inner (two separate animations) */}
      <div className="reveal reveal-show relative w-[19rem] max-w-[82vw]" style={{ animationDelay: '120ms' }}>
       <div className="rounded-[2.25rem] p-3 glass-card animate-float-slow">
        <div className="rounded-[1.6rem] overflow-hidden bg-background/80 border border-border/60">
          {/* app top bar */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <Logo height={16} />
            <span className="text-[11px] font-bold text-muted-foreground tabular-nums">7/20</span>
          </div>
          {/* progress */}
          <div className="px-4">
            <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-[1200ms]"
                style={{ width: active ? '35%' : '0%' }} />
            </div>
          </div>
          {/* sign + question */}
          <div className="px-4 pt-5 pb-2 flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl border-[3px] border-destructive/80 bg-background flex items-center justify-center shrink-0">
              <span className="w-7 h-1.5 rounded-full bg-destructive" />
            </div>
            <p className="text-[13px] font-bold text-foreground leading-snug">
              Ушбу белги нимани англатади?
            </p>
          </div>
          {/* answers */}
          <div className="px-4 pb-5 pt-2 space-y-2">
            {options.map((o, i) => (
              <div
                key={i}
                className="reveal reveal-show flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[12.5px] font-medium transition-colors"
                style={{
                  animationDelay: `${500 + i * 160}ms`,
                  ...(o.ok && active
                    ? { borderColor: 'hsl(var(--success) / 0.6)', background: 'hsl(var(--success) / 0.12)' }
                    : {}),
                }}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                  o.ok ? 'bg-success text-success-foreground' : 'bg-foreground/10 text-muted-foreground'
                }`}>
                  {o.ok ? <Check className="w-3 h-3" strokeWidth={3.5} /> : String.fromCharCode(65 + i)}
                </span>
                <span className={o.ok ? 'text-foreground' : 'text-muted-foreground'}>{o.label}</span>
              </div>
            ))}
          </div>
        </div>
       </div>
      </div>

      {/* floating stat chips */}
      <FloatChip pos="left-0 top-6" float="animate-float" delay={700} icon={<Users className="w-4 h-4 text-primary" />}
        value={`${grads.toLocaleString('ru-RU')}+`} label={t.stats.graduates} />
      <FloatChip pos="right-0 top-24" float="animate-float-rev" delay={900} icon={<Trophy className="w-4 h-4 text-success" />}
        value={`${pass}%`} label={t.stats.passRate} />
      <FloatChip pos="left-2 bottom-6" float="animate-float-slow" delay={1100} icon={<Timer className="w-4 h-4 text-primary" />}
        value="7" label={t.stats.days} />
    </div>
  );
}

function FloatChip({ pos, float, delay, icon, value, label }: {
  pos: string; float: string; delay: number; icon: ReactNode; value: string; label: string;
}) {
  return (
    <div className={`reveal reveal-show absolute ${pos}`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`glass-card rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl max-w-[9.5rem] ${float}`}>
        <span className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">{icon}</span>
        <div className="leading-tight">
          <p className="text-base font-black text-foreground tabular-nums font-display">{value}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

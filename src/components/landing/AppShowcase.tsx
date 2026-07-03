import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Users, Trophy, Timer } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';
import { Logo } from './Logo';

function useCountUp(target: number, durationMs = 1600) {
  const [v, setV] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, durationMs]);
  return v;
}

// Hero visual: a realistic iPhone-Pro device running the app (a real PDD
// question being solved), with quiet floating stat cards around it.
export function AppShowcase({ t }: { t: LandingDict }) {
  const grads = useCountUp(12000);
  const pass = useCountUp(95);

  const options = [
    { label: 'Тавсия этилган тезлик', ok: false },
    { label: 'Тезлик чеклови 40 км/с', ok: true },
    { label: 'Энг кам тезлик 40 км/с', ok: false },
    { label: 'Масофа 40 км', ok: false },
  ];

  return (
    <div className="relative w-full flex items-center justify-center py-4">
      {/* iPhone 17 Pro */}
      <div className="relative animate-float-slow">
        {/* titanium rail */}
        <div
          className="relative rounded-[2.9rem] p-[3px] shadow-2xl"
          style={{ background: 'linear-gradient(150deg, #6c7075, #2c2e33 28%, #43464b 55%, #1f2125 82%)' }}
        >
          <div className="rounded-[2.75rem] p-[9px] bg-[#141518]">
            {/* screen */}
            <div className="relative w-[288px] max-w-[80vw] aspect-[9/19.3] rounded-[2.15rem] overflow-hidden bg-background">
              {/* status bar */}
              <div className="relative flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-foreground">
                <span>9:41</span>
                <span className="flex items-center gap-1 opacity-80">
                  <span className="inline-block w-4 h-2.5 rounded-[3px] border border-foreground/60" />
                </span>
              </div>
              {/* Dynamic Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[86px] h-[26px] rounded-full bg-black flex items-center justify-end pr-2.5 z-10">
                <span className="w-2 h-2 rounded-full bg-[#1c2430] ring-1 ring-white/10" />
              </div>

              {/* app header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-3">
                <Logo height={15} />
                <span className="text-[11px] font-bold text-muted-foreground tabular-nums">7/20</span>
              </div>
              {/* progress */}
              <div className="px-4">
                <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-[1400ms]" style={{ width: '35%' }} />
                </div>
              </div>

              {/* sign + question */}
              <div className="px-4 pt-5 pb-2 flex items-center gap-3">
                {/* speed-limit 40 sign */}
                <div className="shrink-0 w-16 h-16 rounded-full bg-white border-[6px] border-[#d11f2a] flex items-center justify-center shadow-sm">
                  <span className="text-[#111] font-black text-2xl leading-none tracking-tight">40</span>
                </div>
                <p className="text-[13px] font-bold text-foreground leading-snug">
                  Ушбу белги нимани англатади?
                </p>
              </div>

              {/* answers */}
              <div className="px-4 pb-4 pt-2 space-y-2">
                {options.map((o, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[12.5px] font-medium"
                    style={o.ok
                      ? { borderColor: 'hsl(var(--success) / 0.6)', background: 'hsl(var(--success) / 0.12)' }
                      : { borderColor: 'hsl(var(--border))' }}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                      o.ok ? 'bg-success text-success-foreground' : 'bg-foreground/8 text-muted-foreground'
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
        {/* side buttons */}
        <span className="absolute -left-[2px] top-[120px] w-[3px] h-8 rounded-l bg-[#2c2e33]" />
        <span className="absolute -left-[2px] top-[168px] w-[3px] h-12 rounded-l bg-[#2c2e33]" />
        <span className="absolute -left-[2px] top-[224px] w-[3px] h-12 rounded-l bg-[#2c2e33]" />
        <span className="absolute -right-[2px] top-[150px] w-[3px] h-16 rounded-r bg-[#2c2e33]" />
      </div>

      {/* floating stat cards (quiet, always visible) */}
      <FloatChip pos="left-0 sm:-left-4 top-10 animate-float" icon={<Users className="w-4 h-4 text-primary" />}
        value={`${grads.toLocaleString('ru-RU')}+`} label={t.stats.graduates} />
      <FloatChip pos="right-0 sm:-right-2 top-28 animate-float-rev" icon={<Trophy className="w-4 h-4 text-success" />}
        value={`${pass}%`} label={t.stats.passRate} />
      <FloatChip pos="left-1 sm:-left-2 bottom-10 animate-float-slow" icon={<Timer className="w-4 h-4 text-primary" />}
        value="7" label={t.stats.days} />
    </div>
  );
}

function FloatChip({ pos, icon, value, label }: { pos: string; icon: ReactNode; value: string; label: string }) {
  return (
    <div className={`absolute ${pos}`}>
      <div className="glass-card rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 max-w-[9.5rem]">
        <span className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">{icon}</span>
        <div className="leading-tight">
          <p className="text-base font-black text-foreground tabular-nums font-display">{value}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

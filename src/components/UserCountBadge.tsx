import { useEffect, useRef, useState } from 'react';
import { invokeFunction } from '@/integrations/supabase/functionsClient';

// Animates the displayed number toward `target` (odometer-style, like a
// subscriber count ticking up) instead of just snapping to the new value.
function useCountUp(target: number | null) {
  const [displayed, setDisplayed] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === null) return;
    const start = displayed;
    const delta = target - start;
    if (delta === 0) return;

    const durationMs = 1200;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + delta * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // Only re-run when the target changes, not on every `displayed` update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return displayed;
}

const REFRESH_MS = 5 * 60 * 1000;

export function UserCountBadge() {
  const [count, setCount] = useState<number | null>(null);
  const displayed = useCountUp(count);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      const { data } = await invokeFunction<{ count: number }>('user-count', {});
      if (!cancelled && data?.count) setCount(data.count);
    };

    fetchCount();
    const interval = setInterval(fetchCount, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground max-w-[7rem] sm:max-w-none">
      <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-500" />
      </span>
      <span>
        Foydalanuvchilar soni: <span className="font-semibold text-foreground">{displayed.toLocaleString('ru-RU')}</span>
      </span>
    </div>
  );
}

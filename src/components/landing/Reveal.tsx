import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Fades + lifts children into view once. Robust: reveals immediately if the
// element is already on screen at mount, and has a safety fallback so content
// can never stay stuck invisible if the observer doesn't fire.
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already visible on load → show right away.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      setShown(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    obs.observe(el);

    // Safety net: never leave content hidden.
    const t = window.setTimeout(() => setShown(true), 2200);
    return () => {
      obs.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn('reveal', shown && 'reveal-show', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

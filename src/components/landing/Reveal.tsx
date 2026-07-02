import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Fades + lifts children into view once, when they enter the viewport.
// Optional `delay` (ms) staggers items in a grid.
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
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
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

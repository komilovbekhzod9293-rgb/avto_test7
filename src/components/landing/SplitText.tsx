import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Reveals a heading word-by-word (each word lifts + unblurs in sequence).
// `trigger='view'` starts when scrolled into view; 'mount' starts immediately.
export function SplitText({
  text,
  as: Tag = 'span',
  className,
  wordClassName,
  trigger = 'view',
  delay = 0,
  stagger = 55,
  highlight,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  wordClassName?: string;
  trigger?: 'view' | 'mount';
  delay?: number;
  stagger?: number;
  highlight?: (word: string, i: number) => boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(trigger === 'mount');

  useEffect(() => {
    if (trigger === 'mount') return;
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.72 && el.getBoundingClientRect().bottom > 0) {
      setPlay(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPlay(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
    };
  }, [trigger]);

  const words = text.split(' ');

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="split-line" aria-hidden>
          <span
            className={cn('split-word', highlight?.(w, i) && 'text-gradient-primary', wordClassName)}
            style={{
              animationDelay: play ? `${delay + i * stagger}ms` : undefined,
              animationPlayState: play ? 'running' : 'paused',
            }}
          >
            {w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      )) as ReactNode}
    </Tag>
  );
}

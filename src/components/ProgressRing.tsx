import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Compact circular progress indicator used on lesson/topic cards.
export function ProgressRing({
  value,
  size = 44,
  stroke = 4,
  className,
  children,
  tone = 'primary',
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  className?: string;
  children?: ReactNode;
  tone?: 'primary' | 'success';
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = c - (clamped / 100) * c;
  const color = tone === 'success' ? 'hsl(var(--success))' : 'hsl(var(--primary))';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--foreground) / 0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </div>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Continuously scrolls its children horizontally, looping seamlessly.
// Pauses on hover. Duplicates content so the loop has no visible seam.
export function Marquee({
  children,
  reverse = false,
  durationSec = 40,
  gap = '1rem',
  className,
}: {
  children: ReactNode;
  reverse?: boolean;
  durationSec?: number;
  gap?: string;
  className?: string;
}) {
  return (
    <div className={cn('marquee-wrap edge-fade overflow-hidden w-full', className)}>
      <div
        className={cn('marquee', reverse && 'marquee-reverse')}
        style={{ ['--marquee-duration' as string]: `${durationSec}s`, ['--marquee-gap' as string]: gap }}
      >
        <div className="flex shrink-0 items-stretch" style={{ gap }}>{children}</div>
        <div className="flex shrink-0 items-stretch" style={{ gap }} aria-hidden>{children}</div>
      </div>
    </div>
  );
}

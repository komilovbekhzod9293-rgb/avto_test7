import logoUrl from '@/assets/logo-mark.png';
import { cn } from '@/lib/utils';

// The real AVTOTEST7 wordmark. On dark surfaces the dark ink is inverted to
// light so it stays legible; on light surfaces it shows as-is.
export function Logo({ className, height = 26 }: { className?: string; height?: number }) {
  return (
    <img
      src={logoUrl}
      alt="AVTOTEST7"
      height={height}
      style={{ height }}
      className={cn('w-auto select-none dark:invert dark:brightness-110', className)}
      draggable={false}
    />
  );
}

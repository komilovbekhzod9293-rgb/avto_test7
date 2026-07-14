import logoLight from '@/assets/logo-prava-light.png';
import logoDark from '@/assets/logo-prava-dark.png';
import { cn } from '@/lib/utils';

// The Prava On wordmark. Two theme-specific artworks (dark ink for light
// surfaces, white ink for dark surfaces) are swapped via the `dark` class on
// <html> — no filter tricks, so the brand blue stays exact in both themes.
export function Logo({ className, height = 26 }: { className?: string; height?: number }) {
  const common = cn('w-auto select-none', className);
  return (
    <>
      <img
        src={logoLight}
        alt="Prava On"
        height={height}
        style={{ height }}
        className={cn(common, 'dark:hidden')}
        draggable={false}
      />
      <img
        src={logoDark}
        alt="Prava On"
        height={height}
        style={{ height }}
        className={cn(common, 'hidden dark:inline')}
        draggable={false}
      />
    </>
  );
}

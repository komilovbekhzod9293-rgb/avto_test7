import logoLight from '@/assets/logo-prava-light.png';
import logoDark from '@/assets/logo-prava-dark.png';
import { cn } from '@/lib/utils';

// The Prava On wordmark. Two theme-specific artworks (dark ink for light
// surfaces, white ink for dark surfaces) live in one wrapper and are swapped
// via the `dark` class on <html>. The caller's className goes on the WRAPPER
// (so display utilities like `hidden sm:block` control the whole unit) while
// the theme swap stays on the images — otherwise a passed `sm:block` would
// override the hidden state and both logos would show at once.
export function Logo({ className, height = 26 }: { className?: string; height?: number }) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <img
        src={logoLight}
        alt="Prava On"
        height={height}
        style={{ height }}
        className="w-auto select-none dark:hidden"
        draggable={false}
      />
      <img
        src={logoDark}
        alt="Prava On"
        height={height}
        style={{ height }}
        className="w-auto select-none hidden dark:block"
        draggable={false}
      />
    </span>
  );
}

import { cn } from '@/lib/utils';

// Wordmark echoing the AVTOTEST7 logo: grey "AVTO", solid "TEST", boxed italic "7".
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('font-display font-extrabold tracking-tightest select-none inline-flex items-center', className)}>
      <span className="text-muted-foreground">AVTO</span>
      <span className="text-foreground">TEST</span>
      <span
        className="ml-1 inline-flex items-center justify-center rounded-md bg-primary px-1.5 text-primary-foreground italic leading-none shadow-[0_4px_16px_-4px_hsl(var(--primary)/0.8)]"
        style={{ transform: 'skewX(-6deg)' }}
      >
        7
      </span>
    </span>
  );
}

import { Reveal } from './Reveal';
import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={cn('mb-12', center && 'text-center', className)}>
      {eyebrow && (
        <span className="inline-block glass rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display font-extrabold tracking-tightest text-[clamp(1.9rem,4.5vw,3.25rem)] leading-[1.03] text-foreground text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className={cn('text-lg text-muted-foreground mt-4 text-pretty', center && 'mx-auto max-w-2xl')}>{subtitle}</p>
      )}
    </Reveal>
  );
}

import { Reveal } from './Reveal';
import { SplitText } from './SplitText';
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
  // eyebrow intentionally not rendered — keeps every section in the page's own
  // language (no stray English labels) and reads cleaner / more corporate.
  void eyebrow;
  return (
    <div className={cn('mb-12', center && 'text-center', className)}>
      <SplitText
        as="h2"
        text={title}
        stagger={45}
        className="font-display font-extrabold tracking-tightest text-[clamp(1.9rem,4.5vw,3.25rem)] leading-[1.03] text-foreground text-balance"
      />
      {subtitle && (
        <Reveal delay={120}>
          <p className={cn('text-lg text-muted-foreground mt-4 text-pretty', center && 'mx-auto max-w-2xl')}>{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

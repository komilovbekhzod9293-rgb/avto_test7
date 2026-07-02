import { X, ArrowRight, Check } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

export function ProblemSolution({ t }: { t: LandingDict }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeading eyebrow="Problem → Solution" title={t.problem.title} />
        <div className="grid gap-4">
          {t.problem.items.map((item, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="glass-card rounded-3xl p-6 grid sm:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 items-center">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-destructive/12 flex items-center justify-center shrink-0">
                    <X className="w-4 h-4 text-destructive" strokeWidth={2.5} />
                  </div>
                  <p className="text-foreground font-semibold">{item.problem}</p>
                </div>
                <ArrowRight className="hidden sm:block w-5 h-5 text-primary shrink-0" />
                <div className="flex items-start gap-3 sm:border-l sm:border-border/50 sm:pl-6">
                  <div className="w-9 h-9 rounded-xl bg-success/12 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-success" strokeWidth={2.5} />
                  </div>
                  <p className="text-muted-foreground">{item.solution}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

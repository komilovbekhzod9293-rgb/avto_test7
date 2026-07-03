import { UserPlus, MessageCircleMore, GraduationCap } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

const ICONS = [UserPlus, MessageCircleMore, GraduationCap];

export function HowItWorks({ t }: { t: LandingDict }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeading eyebrow="How it works" title={t.howItWorks.title} />
        <div className="grid sm:grid-cols-3 gap-4 relative">
          <div className="hidden sm:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          {t.howItWorks.steps.map((step, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={i} delay={i * 120}>
                <div className="glass-card rounded-3xl p-6 text-center relative h-full">
                  <div className="w-16 h-16 rounded-2xl bg-primary/12 flex items-center justify-center mx-auto mb-4 relative z-10">
                    <Icon className="w-7 h-7 text-primary" strokeWidth={2} />
                  </div>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-black mb-2 tabular-nums">{i + 1}</span>
                  <h3 className="font-bold text-lg text-foreground mb-1.5">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { UserPlus, MessageCircleMore, GraduationCap } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';

const ICONS = [UserPlus, MessageCircleMore, GraduationCap];

export function HowItWorks({ t }: { t: LandingDict }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-center text-foreground mb-14">{t.howItWorks.title}</h2>
        <div className="grid sm:grid-cols-3 gap-8 relative">
          <div className="hidden sm:block absolute top-7 left-[16.67%] right-[16.67%] h-px bg-border" />
          {t.howItWorks.steps.map((step, i) => {
            const Icon = ICONS[i];
            return (
              <div key={i} className="text-center relative">
                <div className="w-14 h-14 rounded-full glass-strong flex items-center justify-center mx-auto mb-4 relative z-10">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs font-bold text-primary mb-1">{i + 1}</p>
                <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

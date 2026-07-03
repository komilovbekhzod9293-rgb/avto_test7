import { Brain, Swords, Timer, Trophy, BookOpen, Wrench } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

const ICONS = [Brain, Swords, Timer, Trophy, BookOpen, Wrench];

export function Features({ t }: { t: LandingDict }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Platform" title={t.features.title} subtitle={t.features.subtitle} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.features.items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={i} delay={(i % 3) * 70}>
                <div className="group glass-card rounded-3xl p-7 sm:p-8 h-full card-hover">
                  <div className="w-14 h-14 rounded-2xl bg-primary/12 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2.5">{item.title}</h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

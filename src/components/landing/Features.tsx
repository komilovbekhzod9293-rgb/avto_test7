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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.features.items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            // first card spans wider for a bento feel on large screens
            const wide = i === 0;
            return (
              <Reveal
                key={i}
                delay={(i % 3) * 80}
                className={wide ? 'sm:col-span-2 lg:col-span-1' : ''}
              >
                <div className="group glass-card rounded-3xl p-6 h-full card-hover hover:glow-soft relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-primary/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" strokeWidth={2.25} />
                  </div>
                  <h3 className="relative text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="relative text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

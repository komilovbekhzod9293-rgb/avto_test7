import { Brain, Swords, Timer, Trophy, BookOpen, Wrench } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';

const ICONS = [Brain, Swords, Timer, Trophy, BookOpen, Wrench];

export function Features({ t }: { t: LandingDict }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3">{t.features.title}</h2>
          <p className="text-muted-foreground text-lg">{t.features.subtitle}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.features.items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div key={i} className="glass rounded-2xl p-6 card-hover">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" strokeWidth={2.25} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

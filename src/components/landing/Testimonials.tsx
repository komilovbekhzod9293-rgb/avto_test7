import { Quote, Star } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

export function Testimonials({ t }: { t: LandingDict }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Reviews" title={t.testimonials.title} subtitle={t.testimonials.note} />
        <div className="grid sm:grid-cols-3 gap-4">
          {t.testimonials.items.map((item, i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <Quote className="w-7 h-7 text-primary/40" />
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <p className="text-foreground leading-relaxed flex-1">{item.quote}</p>
                <p className="text-sm text-muted-foreground font-semibold mt-4">— {item.author}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

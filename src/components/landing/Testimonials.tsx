import { Quote } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';

export function Testimonials({ t }: { t: LandingDict }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-center text-foreground mb-3">{t.testimonials.title}</h2>
        <p className="text-center text-muted-foreground mb-12">{t.testimonials.note}</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {t.testimonials.items.map((item, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <Quote className="w-6 h-6 text-primary/50 mb-3" />
              <p className="text-foreground mb-4">{item.quote}</p>
              <p className="text-sm text-muted-foreground font-medium">— {item.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

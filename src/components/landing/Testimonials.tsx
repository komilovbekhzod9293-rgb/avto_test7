import { Quote, Star } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';
import { SectionHeading } from './SectionHeading';
import { Marquee } from './Marquee';

function Card({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="glass-card rounded-3xl p-6 w-[19rem] sm:w-[22rem] shrink-0 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Quote className="w-7 h-7 text-primary/40" />
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, s) => (
            <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
          ))}
        </div>
      </div>
      <p className="text-foreground leading-relaxed flex-1">{quote}</p>
      <p className="text-sm text-muted-foreground font-semibold mt-4">— {author}</p>
    </div>
  );
}

export function Testimonials({ t }: { t: LandingDict }) {
  // duplicate the few real placeholders so each marquee row feels full
  const row = [...t.testimonials.items, ...t.testimonials.items];
  return (
    <section className="py-24 overflow-hidden">
      <div className="px-4">
        <SectionHeading eyebrow="Reviews" title={t.testimonials.title} subtitle={t.testimonials.note} />
      </div>
      <div className="space-y-4">
        <Marquee durationSec={46} gap="1rem">
          {row.map((it, i) => (
            <Card key={`a${i}`} quote={it.quote} author={it.author} />
          ))}
        </Marquee>
        <Marquee durationSec={56} gap="1rem" reverse>
          {row.map((it, i) => (
            <Card key={`b${i}`} quote={it.quote} author={it.author} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

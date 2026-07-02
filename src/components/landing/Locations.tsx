import { MapPin, Clock } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

export function Locations({ t }: { t: LandingDict }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <SectionHeading eyebrow="Offline" title={t.locations.title} />
        <Reveal className="flex items-center justify-center gap-2 text-muted-foreground mb-10 -mt-6">
          <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            {t.locations.schedule}
          </span>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {t.locations.branches.map((branch, i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="group glass-card rounded-3xl p-6 flex items-start gap-4 card-hover hover:glow-soft h-full">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{branch.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{branch.address}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

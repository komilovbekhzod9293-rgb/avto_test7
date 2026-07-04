import { Clock, ArrowUpRight, MapPin } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

export function Locations({ t }: { t: LandingDict }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <SectionHeading eyebrow="Offline" title={t.locations.title} />
        <Reveal className="flex flex-col items-center gap-4 mb-10 -mt-6">
          <span className="inline-flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="w-4 h-4 text-primary" strokeWidth={1.75} />
            {t.locations.schedule}
          </span>
          <div className="flex flex-wrap justify-center gap-2.5">
            {t.locations.shifts.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 font-mono text-[15px] font-medium text-foreground tabular-nums">
                <span className="text-primary">{i + 1}</span> {s}
              </span>
            ))}
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {t.locations.branches.map((branch, i) => (
            <Reveal key={i} delay={i * 90}>
              <a
                href={branch.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="group glass-card rounded-3xl p-6 flex items-start gap-4 card-hover hover:glow-soft h-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground">{branch.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{branch.address}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary">
                    {t.locations.mapCta}
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

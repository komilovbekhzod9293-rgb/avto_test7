import { MapPin, Clock } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';

export function Locations({ t }: { t: LandingDict }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-center text-foreground mb-4">{t.locations.title}</h2>
        <p className="flex items-center justify-center gap-2 text-muted-foreground mb-10">
          <Clock className="w-4 h-4" />
          {t.locations.schedule}
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          {t.locations.branches.map((branch, i) => (
            <div key={i} className="glass rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{branch.name}</h3>
                <p className="text-sm text-muted-foreground">{branch.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

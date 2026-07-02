import { X, Check } from 'lucide-react';
import type { LandingDict } from '@/lib/i18n';

export function ProblemSolution({ t }: { t: LandingDict }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-center text-foreground mb-12">{t.problem.title}</h2>
        <div className="grid gap-4">
          {t.problem.items.map((item, i) => (
            <div key={i} className="glass rounded-2xl p-6 grid sm:grid-cols-2 gap-4 items-center">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 text-destructive" />
                </div>
                <p className="text-foreground font-medium">{item.problem}</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-success" />
                </div>
                <p className="text-muted-foreground">{item.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

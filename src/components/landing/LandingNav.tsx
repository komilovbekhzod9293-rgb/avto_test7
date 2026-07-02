import { Button } from '@/components/ui/button';
import type { LandingDict } from '@/lib/i18n';

export function LandingNav({ t, onLogin }: { t: LandingDict; onLogin: () => void }) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto glass rounded-2xl px-5 py-3 flex items-center justify-between">
        <p className="text-lg font-black text-foreground">
          Avto<span className="text-primary">Test7</span>
        </p>
        <Button onClick={onLogin} className="font-semibold">
          {t.nav.login}
        </Button>
      </div>
    </header>
  );
}

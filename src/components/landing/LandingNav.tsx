import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import type { LandingDict, Lang } from '@/lib/i18n';
import { Logo } from './Logo';
import { LangSwitcher } from './LangSwitcher';

export function LandingNav({
  t,
  lang,
  setLang,
  onLogin,
}: {
  t: LandingDict;
  lang: Lang;
  setLang: (l: Lang) => void;
  onLogin: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const NAV_LABELS: Record<Lang, string[]> = {
    uz: ['Платформа', 'Тарифлар', 'Филиаллар', 'Саволлар'],
    ru: ['Платформа', 'Тарифы', 'Филиалы', 'Вопросы'],
    en: ['Platform', 'Pricing', 'Branches', 'FAQ'],
  };
  const ids = ['features', 'pricing', 'locations', 'faq'];
  const links = ids.map((id, i) => ({ id, label: NAV_LABELS[lang][i] }));

  // HashRouter treats `#id` links as routes (-> 404), so scroll manually.
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 px-3 sm:px-4 pt-3">
      <div
        className={cn(
          'max-w-6xl mx-auto rounded-2xl px-3 sm:px-5 flex items-center justify-between transition-all duration-300',
          scrolled ? 'glass-strong h-14 shadow-[0_20px_50px_-30px_hsl(224_60%_3%/0.9)]' : 'h-16 bg-transparent border-transparent',
        )}
      >
        <a
          href="#top"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="shrink-0"
        >
          <Logo height={26} />
        </a>

        <nav className="hidden xl:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={scrollTo(l.id)}
              className="px-3.5 py-2 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitcher lang={lang} setLang={setLang} />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="glass w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-foreground/5 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Button
            onClick={onLogin}
            className="h-9 px-4 rounded-full font-bold hidden sm:inline-flex glow-primary"
          >
            {t.nav.login}
          </Button>
        </div>
      </div>
    </header>
  );
}

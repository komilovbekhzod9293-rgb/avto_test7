import { Phone, Send, Instagram } from 'lucide-react';
import type { LandingDict, Lang } from '@/lib/i18n';
import { Logo } from './Logo';
import { LangSwitcher } from './LangSwitcher';

export function Footer({ t, lang, setLang }: { t: LandingDict; lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <footer className="relative mt-10 px-4 pb-10">
      <div className="max-w-6xl mx-auto glass-card rounded-[2rem] p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[60%] h-48 bg-primary/20 blur-3xl pointer-events-none" />

        <div className="relative grid sm:grid-cols-3 gap-10">
          <div>
            <Logo className="text-xl mb-3" />
            <p className="text-sm text-muted-foreground max-w-xs">{t.footer.tagline}</p>
            <div className="mt-5">
              <LangSwitcher lang={lang} setLang={setLang} />
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-foreground mb-4">{t.footer.contact}</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <a href="tel:+998555132777" className="flex items-center gap-2.5 hover:text-foreground transition-colors">
                <span className="w-8 h-8 rounded-lg glass flex items-center justify-center"><Phone className="w-4 h-4" /></span>
                +998 55 513 27 77
              </a>
              <a href="https://t.me/avto_test7" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 hover:text-foreground transition-colors">
                <span className="w-8 h-8 rounded-lg glass flex items-center justify-center"><Send className="w-4 h-4" /></span>
                Telegram
              </a>
              <a href="https://instagram.com/avto_test7" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 hover:text-foreground transition-colors">
                <span className="w-8 h-8 rounded-lg glass flex items-center justify-center"><Instagram className="w-4 h-4" /></span>
                Instagram
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-foreground mb-4">{t.footer.legal}</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="opacity-60 cursor-not-allowed">{t.footer.offer}</p>
              <p className="opacity-60 cursor-not-allowed">{t.footer.privacy}</p>
            </div>
          </div>
        </div>

        <div className="relative border-t border-border/40 mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AvtoTest7. {t.footer.rights}.
          </p>
        </div>
      </div>
    </footer>
  );
}

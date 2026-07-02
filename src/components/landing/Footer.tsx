import { Phone, Send, Instagram } from 'lucide-react';
import { LANGS, Lang } from '@/lib/i18n';
import type { LandingDict } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Footer({ t, lang, setLang }: { t: LandingDict; lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <footer className="py-12 px-4 border-t border-border/50">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8">
        <div>
          <p className="text-xl font-black text-foreground mb-2">AvtoTest7</p>
          <p className="text-sm text-muted-foreground">{t.footer.tagline}</p>
          <div className="flex gap-1 mt-4">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-full border transition-colors',
                  lang === l.code
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-foreground mb-3">{t.footer.contact}</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <a href="tel:+998555132777" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Phone className="w-4 h-4" /> +998 55 513 27 77
            </a>
            <a
              href="https://t.me/avto_test7"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Send className="w-4 h-4" /> Telegram
            </a>
            <a
              href="https://instagram.com/avto_test7"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Instagram className="w-4 h-4" /> Instagram
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-foreground mb-3">{t.footer.legal}</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="opacity-60 cursor-not-allowed">{t.footer.offer}</p>
            <p className="opacity-60 cursor-not-allowed">{t.footer.privacy}</p>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-10">
        © {new Date().getFullYear()} AvtoTest7. {t.footer.rights}.
      </p>
    </footer>
  );
}

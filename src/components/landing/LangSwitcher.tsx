import { LANGS, type Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const SHORT: Record<Lang, string> = { uz: 'Уз', uzl: 'Uz', ru: 'Рус', en: 'Eng' };

// Prominent segmented language control for the header (uz / ru / en).
export function LangSwitcher({
  lang,
  setLang,
  className,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  className?: string;
}) {
  return (
    <div className={cn('glass rounded-full p-1 flex items-center', className)}>
      {LANGS.map(({ code }) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            className={cn(
              'relative h-7 sm:h-8 min-w-[1.85rem] sm:min-w-[2.4rem] rounded-full px-1.5 sm:px-2.5 text-[11.5px] sm:text-[13px] font-bold tracking-wide transition-all duration-300',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {SHORT[code]}
          </button>
        );
      })}
    </div>
  );
}

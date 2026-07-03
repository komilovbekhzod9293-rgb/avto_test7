import { useEffect, useState } from 'react';
import { Lang, LANDING_DICTS, LandingDict } from '@/lib/i18n';

const LANG_KEY = 'landing_lang';

function getInitialLang(): Lang {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored === 'uz' || stored === 'uzl' || stored === 'ru' || stored === 'en') return stored;
  return 'uz';
}

export function useLandingLang(): { lang: Lang; setLang: (l: Lang) => void; t: LandingDict } {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  return { lang, setLang: setLangState, t: LANDING_DICTS[lang] };
}

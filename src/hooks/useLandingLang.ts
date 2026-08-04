import { useEffect, useState } from 'react';
import { Lang, LANDING_DICTS, LandingDict, getLandingLang, setLandingLang, LANDING_LANG_CHANGE_EVENT } from '@/lib/i18n';

export function useLandingLang(): { lang: Lang; setLang: (l: Lang) => void; t: LandingDict } {
  const [lang, setLangState] = useState<Lang>(getLandingLang);

  useEffect(() => {
    const onChange = () => setLangState(getLandingLang());
    window.addEventListener(LANDING_LANG_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(LANDING_LANG_CHANGE_EVENT, onChange);
  }, []);

  return { lang, setLang: setLandingLang, t: LANDING_DICTS[lang] };
}

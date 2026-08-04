import { useEffect, useState } from 'react';
import { getTestLang, setTestLang, TestLang, TEST_LANG_CHANGE_EVENT } from '@/lib/testLang';

export function useTestLang(): [TestLang, (lang: TestLang) => void] {
  const [lang, setLangState] = useState<TestLang>(getTestLang);

  useEffect(() => {
    const onChange = () => setLangState(getTestLang());
    window.addEventListener(TEST_LANG_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(TEST_LANG_CHANGE_EVENT, onChange);
  }, []);

  const set = (l: TestLang) => setTestLang(l);

  return [lang, set];
}

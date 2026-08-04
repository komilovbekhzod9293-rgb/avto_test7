import { useTestLang } from './useTestLang';

// In-app UI translation helper: t('уз текст', 'рус текст'). Kept inline next
// to each string (no central dictionary) so translations stay easy to spot
// and edit alongside the markup that uses them. Driven by the same
// browser-local test_lang preference as the question content itself.
export function useT() {
  const [lang] = useTestLang();
  return (uz: string, ru: string) => (lang === 'ru' ? ru : uz);
}

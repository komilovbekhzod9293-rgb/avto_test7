import { safeStorage } from './safeStorage';

export type TestLang = 'uz' | 'ru';

const KEY = 'test_lang';
const CHANGE_EVENT = 'test_lang_change';

export function getTestLang(): TestLang {
  return safeStorage.getItem(KEY) === 'ru' ? 'ru' : 'uz';
}

export function setTestLang(lang: TestLang) {
  safeStorage.setItem(KEY, lang);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export { CHANGE_EVENT as TEST_LANG_CHANGE_EVENT };

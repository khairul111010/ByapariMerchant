import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import { KV_KEYS, kv } from '../storage/mmkv';
import { bn } from './bn';
import { en } from './en';
import type { Lang } from './format';

export const hasChosenLanguage = (): boolean =>
  kv.getString(KV_KEYS.language) !== undefined;

function initialLanguage(): Lang {
  const saved = kv.getString(KV_KEYS.language);
  if (saved === 'bn' || saved === 'en') {
    return saved;
  }
  const locale = getLocales()[0];
  return locale?.languageCode === 'bn' ? 'bn' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: { bn: { translation: bn }, en: { translation: en } },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLanguage(lang: Lang): void {
  kv.set(KV_KEYS.language, lang);
  void i18n.changeLanguage(lang);
}

export function useLang(): Lang {
  const { i18n: inst } = useTranslation();
  return inst.language === 'bn' ? 'bn' : 'en';
}

export default i18n;

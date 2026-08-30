'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { APP_LANGUAGE_CODES } from '@/lib/languages';

import enTranslation from '../../public/locales/en/translation.json';
import itTranslation from '../../public/locales/it/translation.json';
import frTranslation from '../../public/locales/fr/translation.json';
import ukTranslation from '../../public/locales/uk/translation.json';

const resources = {
  en: { translation: enTranslation },
  it: { translation: itTranslation },
  fr: { translation: frTranslation },
  uk: { translation: ukTranslation },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      supportedLngs: APP_LANGUAGE_CODES,
      nonExplicitSupportedLngs: true,
      load: 'languageOnly',
      debug: false,
      defaultNS: 'translation',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    });
}

export default i18n;

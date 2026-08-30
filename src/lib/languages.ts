export const APP_LANGUAGES = [
  {
    code: 'en',
    englishName: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    localeCode: 'en-US',
  },
  {
    code: 'it',
    englishName: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    localeCode: 'it-IT',
  },
  {
    code: 'fr',
    englishName: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    localeCode: 'fr-FR',
  },
  {
    code: 'uk',
    englishName: 'Ukrainian',
    nativeName: 'Українська',
    flag: '🇺🇦',
    localeCode: 'uk-UA',
  },
] as const;

export const APP_LANGUAGE_CODES = APP_LANGUAGES.map((language) => language.code);

export type AppLanguageCode = (typeof APP_LANGUAGES)[number]['code'];

export function isAppLanguageCode(value: unknown): value is AppLanguageCode {
  return APP_LANGUAGE_CODES.includes(value as AppLanguageCode);
}

const LANGUAGE_NAMES: Record<string, string> = {
  ar: 'Arabic',
  de: 'German',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  pl: 'Polish',
  pt: 'Portuguese',
  ru: 'Russian',
  uk: 'Ukrainian',
  zh: 'Chinese',
};

const LANGUAGE_ALIASES: Record<string, string> = {
  arabic: 'ar',
  chinese: 'zh',
  english: 'en',
  french: 'fr',
  german: 'de',
  italian: 'it',
  japanese: 'ja',
  korean: 'ko',
  polish: 'pl',
  portuguese: 'pt',
  russian: 'ru',
  spanish: 'es',
  ukrainian: 'uk',
};

export function normalizeLanguageCode(code: string): string {
  const normalized = code.trim().toLowerCase();

  return LANGUAGE_ALIASES[normalized] ?? normalized.split('-')[0];
}

export function getLanguageEnglishName(code: string): string {
  const normalized = normalizeLanguageCode(code);

  return LANGUAGE_NAMES[normalized] ?? code;
}

export function getAppLanguageLocale(code: string): string {
  const normalized = normalizeLanguageCode(code);
  const language = APP_LANGUAGES.find((candidate) => candidate.code === normalized);

  return language?.localeCode ?? 'en-US';
}

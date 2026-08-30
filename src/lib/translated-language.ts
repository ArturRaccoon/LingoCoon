import { getAppLanguageLocale } from '@/lib/languages';

type TranslateFunction = (
  key: string,
  options?: { defaultValue?: string },
) => string;

export function getTranslatedLanguageName(
  t: TranslateFunction,
  languageCode: string | null | undefined,
): string {
  if (!languageCode) {
    return '-';
  }

  return t(`languages.${getAppLanguageLocale(languageCode)}`, {
    defaultValue: languageCode.toUpperCase(),
  });
}

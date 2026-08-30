import { getLanguageEnglishName } from '@/lib/languages';

export function getPromptLanguageName(languageCode: string): string {
  return getLanguageEnglishName(languageCode);
}

export function buildAlwaysUseNativeLanguageRule(nativeLanguageName: string): string {
  return `ALWAYS respond in ${nativeLanguageName}, no matter what language the student writes in.`;
}

import { isAppLanguageCode } from '@/lib/languages';

export type ValidatedDeckInput = {
  title: string;
  language_from: 'en' | 'it' | 'fr' | 'uk';
  language_to: 'en' | 'it' | 'fr' | 'uk';
};

export function validateDeckInput(
  title: unknown,
  languageFrom: unknown,
  languageTo: unknown,
): ValidatedDeckInput | { error: string } {
  if (typeof title !== 'string' || !title.trim()) return { error: 'Title cannot be empty.' };
  if (title.trim().length > 100) return { error: 'Title too long (max 100 characters).' };
  if (!isAppLanguageCode(languageFrom) || !isAppLanguageCode(languageTo)) {
    return { error: 'Unsupported deck language.' };
  }
  if (languageFrom === languageTo) return { error: 'Languages must be different.' };

  return {
    title: title.trim(),
    language_from: languageFrom,
    language_to: languageTo,
  };
}

export function normalizeExampleSentence(
  value: unknown,
): { value: string | null } | { error: string } {
  if (value == null || value === '') return { value: null };
  if (typeof value !== 'string') return { error: 'Example sentence must be text.' };

  const sentence = value.trim();
  if (sentence.length > 1000) return { error: 'Example sentence is too long.' };

  return { value: sentence || null };
}

import { getLanguageEnglishName, isAppLanguageCode } from '@/lib/languages';

export interface AiDeckStudentContext {
  currentLevel: string | null;
  learningPurpose: string | null;
  learningPurposeDetails: string | null;
  nativeLanguage: string | null;
  targetLanguage: string | null;
}

export function buildPersonalizedDeckPrompt(
  prompt: string,
  context: AiDeckStudentContext | null | undefined,
): string {
  const nativeLanguage = isAppLanguageCode(context?.nativeLanguage)
    ? context.nativeLanguage
    : 'en';
  const targetLanguage = isAppLanguageCode(context?.targetLanguage)
    ? context.targetLanguage
    : nativeLanguage === 'en' ? 'it' : 'en';
  const nativeLanguageName = getLanguageEnglishName(nativeLanguage);
  const targetLanguageName = getLanguageEnglishName(targetLanguage);

  return `Student profile:
- Native language: ${nativeLanguageName} (${nativeLanguage})
- Target language: ${targetLanguageName} (${targetLanguage})
- Current level: ${normalizeProfileValue(context?.currentLevel)}
- Learning purpose: ${normalizeProfileValue(context?.learningPurpose)}
- Additional goal details: ${normalizeProfileValue(context?.learningPurposeDetails)}

Create a deck for this student based on their request below.
Use ${targetLanguageName} on card fronts and ${nativeLanguageName} on card backs unless the request explicitly asks for a different direction.
Adapt vocabulary difficulty and examples to the student's current level and learning purpose.

Student request:
${prompt}`;
}

function normalizeProfileValue(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 500) || 'not specified' : 'not specified';
}

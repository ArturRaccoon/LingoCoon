import { extractJsonObject } from '@/lib/server/ai-json';
import { cardTranslationResponseSchema } from '@/lib/server/card-translation-schema';
import type { CardTranslationSuggestion } from '@/types/card-translation';

export class InvalidCardTranslationResponseError extends Error {
  constructor() {
    super('The AI returned invalid flashcard translation suggestions.');
    this.name = 'InvalidCardTranslationResponseError';
  }
}

export function parseCardTranslationSuggestions(
  rawResponse: string,
  sourceText: string,
): CardTranslationSuggestion[] {
  try {
    const result = cardTranslationResponseSchema.safeParse(
      JSON.parse(extractJsonObject(rawResponse)),
    );

    if (!result.success) {
      console.error(
        '[parseCardTranslationSuggestions] Invalid fields:',
        result.error.issues.map((issue) => issue.path.join('.') || 'response'),
      );
      throw new InvalidCardTranslationResponseError();
    }

    const suggestions = removeInvalidSuggestions(result.data.suggestions, sourceText);
    if (suggestions.length === 0) throw new InvalidCardTranslationResponseError();

    return suggestions;
  } catch (error) {
    if (error instanceof InvalidCardTranslationResponseError) throw error;

    throw new InvalidCardTranslationResponseError();
  }
}

function removeInvalidSuggestions(
  suggestions: CardTranslationSuggestion[],
  sourceText: string,
): CardTranslationSuggestion[] {
  const seenTranslations = new Set<string>();
  const normalizedSourceText = sourceText.trim().toLocaleLowerCase();

  return suggestions.filter((suggestion) => {
    const normalizedTranslation = suggestion.translation.trim().toLocaleLowerCase();
    const normalizedExample = suggestion.exampleSentence.toLocaleLowerCase();
    if (
      seenTranslations.has(normalizedTranslation) ||
      !normalizedExample.includes(normalizedSourceText)
    ) {
      return false;
    }

    seenTranslations.add(normalizedTranslation);
    return true;
  });
}

'use server';

import { getLanguageEnglishName } from '@/lib/languages';
import { sendStructuredRequestToGemini, getHumanReadableAiError } from '@/lib/server/ai-client';
import {
  buildCardTranslationHistory,
  buildCardTranslationSystemPrompt,
  getCardTranslationAiOptions,
  InvalidCardTranslationResponseError,
  parseCardTranslationSuggestions,
} from '@/lib/server/card-translation';
import { loadOwnedDeck } from '@/lib/server/deck-data';
import { requireAuthenticatedClaims } from '@/lib/supabase/auth';
import type { CardTranslationSuggestion } from '@/types/card-translation';

const MAX_TEXT_LENGTH = 200;

export type CardTranslationErrorKey =
  | 'invalid_text'
  | 'deck_not_found'
  | 'invalid_response'
  | 'service_unavailable';

interface TranslationLanguagePair {
  sourceLanguage: string;
  translationLanguage: string;
}

export async function suggestCardTranslations(
  deckId: string,
  text: string,
): Promise<{ suggestions?: CardTranslationSuggestion[]; errorKey?: CardTranslationErrorKey }> {
  if (typeof deckId !== 'string' || !deckId.trim()) return { errorKey: 'deck_not_found' };
  if (typeof text !== 'string') return { errorKey: 'invalid_text' };

  const wordOrPhrase = text.trim();
  if (!wordOrPhrase || wordOrPhrase.length > MAX_TEXT_LENGTH) {
    return { errorKey: 'invalid_text' };
  }

  try {
    const { claims, supabase } = await requireAuthenticatedClaims();
    const { deck, error } = await loadOwnedDeck(supabase, claims.sub, deckId);
    if (error || !deck) return { errorKey: 'deck_not_found' };

    const languages = getTranslationLanguages(deck.language_from, deck.language_to);
    const response = await sendStructuredRequestToGemini(
      buildCardTranslationSystemPrompt(
        languages.sourceLanguage,
        languages.translationLanguage,
      ),
      buildCardTranslationHistory(wordOrPhrase),
      getCardTranslationAiOptions(claims.sub),
    );

    return { suggestions: parseCardTranslationSuggestions(response, wordOrPhrase) };
  } catch (error) {
    const message = error instanceof InvalidCardTranslationResponseError
      ? error.message
      : getHumanReadableAiError(error);
    console.error('[suggestCardTranslations]', message);

    return {
      errorKey: error instanceof InvalidCardTranslationResponseError
        ? 'invalid_response'
        : 'service_unavailable',
    };
  }
}

function getTranslationLanguages(
  sourceLanguageCode: string,
  translationLanguageCode: string,
): TranslationLanguagePair {
  return {
    sourceLanguage: getLanguageEnglishName(sourceLanguageCode),
    translationLanguage: getLanguageEnglishName(translationLanguageCode),
  };
}

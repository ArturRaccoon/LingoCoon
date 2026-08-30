'use server';

import { sendStructuredRequestToGemini, getHumanReadableAiError } from '@/lib/server/ai-client';
import {
  buildLexicoonHistory,
  buildLexicoonSystemPrompt,
  getLexicoonAiOptions,
  InvalidLexicoonResponseError,
  parseLexicoonEntry,
} from '@/lib/server/lexicoon';
import { getLanguageEnglishName, isAppLanguageCode } from '@/lib/languages';
import { requireAuthenticatedClaims } from '@/lib/supabase/auth';
import { getLanguageProfile } from '@/lib/supabase/profile';
import type { LexicoonEntry } from '@/types/lexicoon';

const MAX_QUERY_LENGTH = 100;

export type LexicoonErrorKey =
  | 'invalid_query'
  | 'invalid_response'
  | 'service_unavailable';

interface LexicoonLanguages {
  nativeLanguageName: string;
  targetLanguageName: string;
}

export async function lookUpLexicoonEntry(
  query: string,
): Promise<{ entry?: LexicoonEntry; errorKey?: LexicoonErrorKey }> {
  if (typeof query !== 'string') return { errorKey: 'invalid_query' };

  const word = query.trim();
  if (!word || word.length > MAX_QUERY_LENGTH) return { errorKey: 'invalid_query' };

  try {
    const { claims, supabase } = await requireAuthenticatedClaims();
    const profile = await getLanguageProfile(supabase, claims.sub);
    const languages = getLexicoonLanguages(profile);
    const systemPrompt = buildLexicoonSystemPrompt(
      languages.nativeLanguageName,
      languages.targetLanguageName,
    );
    const response = await sendStructuredRequestToGemini(
      systemPrompt,
      buildLexicoonHistory(word, languages.targetLanguageName),
      getLexicoonAiOptions(claims.sub),
    );

    try {
      return { entry: parseLexicoonEntry(response, word) };
    } catch (error) {
      if (!(error instanceof InvalidLexicoonResponseError)) throw error;

      const retryResponse = await sendStructuredRequestToGemini(
        systemPrompt,
        buildLexicoonHistory(word, languages.targetLanguageName, true),
        getLexicoonAiOptions(claims.sub),
      );

      return { entry: parseLexicoonEntry(retryResponse, word) };
    }
  } catch (error) {
    const message = error instanceof InvalidLexicoonResponseError
      ? error.message
      : getHumanReadableAiError(error);
    console.error('[lookUpLexicoonEntry]', message);

    return {
      errorKey: error instanceof InvalidLexicoonResponseError
        ? 'invalid_response'
        : 'service_unavailable',
    };
  }
}

function getLexicoonLanguages(profile: {
  nativeLanguage: string | null;
  targetLanguage: string | null;
}): LexicoonLanguages {
  const nativeLanguage = isAppLanguageCode(profile.nativeLanguage)
    ? profile.nativeLanguage
    : 'en';
  const targetLanguage = isAppLanguageCode(profile.targetLanguage)
    ? profile.targetLanguage
    : nativeLanguage === 'en' ? 'it' : 'en';

  return {
    nativeLanguageName: getLanguageEnglishName(nativeLanguage),
    targetLanguageName: getLanguageEnglishName(targetLanguage),
  };
}

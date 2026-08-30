import { normalizeLanguageCode } from '@/lib/languages';
import { extractJsonObject } from '@/lib/server/ai-json';
import {
  getLexicoonCorrection,
  isLikelySpellingCorrection,
} from '@/lib/server/lexicoon-correction';
import { filterMeaningsBySourceText } from '@/lib/server/lexicoon-meanings';
import { lexicoonEntrySchema } from '@/lib/server/lexicoon-schema';
import type { LexicoonEntry } from '@/types/lexicoon';

export class InvalidLexicoonResponseError extends Error {
  constructor() {
    super('The AI returned an invalid dictionary entry.');
    this.name = 'InvalidLexicoonResponseError';
  }
}

export function parseLexicoonEntry(rawResponse: string, sourceText: string): LexicoonEntry {
  try {
    const result = lexicoonEntrySchema.safeParse(JSON.parse(extractJsonObject(rawResponse)));

    if (!result.success) {
      console.error(
        '[parseLexicoonEntry] Invalid fields:',
        result.error.issues.map((issue) => issue.path.join('.') || 'entry'),
      );
      throw new InvalidLexicoonResponseError();
    }

    const meanings = filterMeaningsBySourceText(result.data.meanings, [
      sourceText,
      result.data.word,
    ]);
    if (meanings.length === 0) throw new InvalidLexicoonResponseError();

    const correction = getLexicoonCorrection(sourceText, result.data.word);
    if (correction && !isLikelySpellingCorrection(correction.from, correction.to)) {
      throw new InvalidLexicoonResponseError();
    }

    return {
      ...result.data,
      correction,
      languageCode: normalizeLanguageCode(result.data.language),
      meanings,
    };
  } catch (error) {
    if (error instanceof InvalidLexicoonResponseError) throw error;

    throw new InvalidLexicoonResponseError();
  }
}

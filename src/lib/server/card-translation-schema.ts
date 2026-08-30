import { z } from 'zod';

export const cardTranslationSuggestionSchema = z.object({
  definition: z.string().trim().min(1).max(500),
  exampleSentence: z.string().trim().min(1).max(500),
  exampleTranslation: z.string().trim().min(1).max(500),
  partOfSpeech: z.string().trim().min(1).max(100),
  translation: z.string().trim().min(1).max(500),
});

export const cardTranslationResponseSchema = z.object({
  suggestions: z.array(cardTranslationSuggestionSchema).min(1).max(4),
});

export const CARD_TRANSLATION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          translation: { type: 'string' },
          partOfSpeech: { type: 'string' },
          definition: { type: 'string' },
          exampleSentence: { type: 'string' },
          exampleTranslation: { type: 'string' },
        },
        required: [
          'translation',
          'partOfSpeech',
          'definition',
          'exampleSentence',
          'exampleTranslation',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['suggestions'],
  additionalProperties: false,
} as const;

export function getCardTranslationAiOptions(userId: string) {
  return {
    jsonSchema: CARD_TRANSLATION_JSON_SCHEMA,
    maxTokens: 600,
    schemaName: 'card_translation_suggestions',
    userId,
  };
}

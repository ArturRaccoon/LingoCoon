import { z } from 'zod';
import { isAppLanguageCode } from '@/lib/languages';

const generatedCardSchema = z.object({
  front: z.string().min(1).max(500).trim(),
  back: z.string().min(1).max(500).trim(),
  example_sentence: z
    .string()
    .max(1000)
    .trim()
    .nullable()
    .optional()
    .transform((value) => value ?? null),
});

export const generatedDeckSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  language_from: z.string().trim().toLowerCase().refine(isAppLanguageCode),
  language_to: z.string().trim().toLowerCase().refine(isAppLanguageCode),
  cards: z.array(generatedCardSchema).min(1).max(50),
}).refine((deck) => deck.language_from !== deck.language_to);

export const DECK_GENERATION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    language_from: { type: 'string', enum: ['en', 'it', 'fr', 'uk'] },
    language_to: { type: 'string', enum: ['en', 'it', 'fr', 'uk'] },
    cards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          front: { type: 'string' },
          back: { type: 'string' },
          example_sentence: {
            anyOf: [{ type: 'string' }, { type: 'null' }],
          },
        },
        required: ['front', 'back', 'example_sentence'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'language_from', 'language_to', 'cards'],
  additionalProperties: false,
} as const;

export function getDeckGenerationAiOptions(userId: string) {
  return {
    jsonSchema: DECK_GENERATION_JSON_SCHEMA,
    maxTokens: 1600,
    schemaName: 'generated_flashcard_deck',
    userId,
  };
}

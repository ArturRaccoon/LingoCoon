import { z } from 'zod';

const exampleSchema = z.object({
  sentence: z.string().trim().min(1).max(500),
  translation: z.string().trim().min(1).max(500),
});

const meaningSchema = z.object({
  antonyms: z.array(z.string().trim().min(1).max(100)).max(8).default([]),
  definition: z.string().trim().min(1).max(1000),
  examples: z.array(exampleSchema).min(1).max(4),
  partOfSpeech: z.string().trim().min(1).max(100),
  synonyms: z.array(z.string().trim().min(1).max(100)).max(8).default([]),
  translation: z.string().trim().min(1).max(500),
  usageNote: z.string().trim().max(1000).nullable().optional().transform((value) => value ?? null),
});

const contrastSchema = z.object({
  explanation: z.string().trim().min(1).max(800),
  label: z.string().trim().min(1).max(120),
  word: z.string().trim().min(1).max(100),
});

const usageSchema = z.object({
  spoken: z.string().trim().min(1).max(800),
  written: z.string().trim().min(1).max(800),
});

export const lexicoonEntrySchema = z.object({
  category: z.string().trim().min(1).max(200),
  collocations: z.array(z.string().trim().min(1).max(120)).max(8).default([]),
  connotation: z.string().trim().min(1).max(100),
  contrast: contrastSchema.nullable().optional().transform((value) => value ?? null),
  curiosity: z.string().trim().max(1000).nullable().optional().transform((value) => value ?? null),
  essence: z.string().trim().min(1).max(500),
  explanation: z.string().trim().min(1).max(1200),
  language: z.string().trim().min(1).max(100),
  meanings: z.array(meaningSchema).min(1).max(5),
  pronunciation: z.string().trim().max(200).nullable().optional().transform((value) => value ?? null),
  register: z.string().trim().min(1).max(100),
  synonyms: z.array(z.string().trim().min(1).max(100)).max(8).default([]),
  usage: usageSchema.nullable().optional().transform((value) => value ?? null),
  word: z.string().trim().min(1).max(100),
});

export const LEXICOON_JSON_SCHEMA = {
  type: 'object',
  properties: {
    word: { type: 'string' },
    language: { type: 'string' },
    pronunciation: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    category: { type: 'string' },
    register: { type: 'string' },
    connotation: { type: 'string' },
    essence: { type: 'string' },
    explanation: { type: 'string' },
    contrast: {
      anyOf: [
        {
          type: 'object',
          properties: {
            word: { type: 'string' },
            label: { type: 'string' },
            explanation: { type: 'string' },
          },
          required: ['word', 'label', 'explanation'],
          additionalProperties: false,
        },
        { type: 'null' },
      ],
    },
    synonyms: { type: 'array', items: { type: 'string' } },
    collocations: { type: 'array', items: { type: 'string' } },
    usage: {
      anyOf: [
        {
          type: 'object',
          properties: {
            written: { type: 'string' },
            spoken: { type: 'string' },
          },
          required: ['written', 'spoken'],
          additionalProperties: false,
        },
        { type: 'null' },
      ],
    },
    curiosity: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    meanings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          partOfSpeech: { type: 'string' },
          translation: { type: 'string' },
          definition: { type: 'string' },
          usageNote: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          examples: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sentence: { type: 'string' },
                translation: { type: 'string' },
              },
              required: ['sentence', 'translation'],
              additionalProperties: false,
            },
          },
          synonyms: { type: 'array', items: { type: 'string' } },
          antonyms: { type: 'array', items: { type: 'string' } },
        },
        required: [
          'partOfSpeech',
          'translation',
          'definition',
          'usageNote',
          'examples',
          'synonyms',
          'antonyms',
        ],
        additionalProperties: false,
      },
    },
  },
  required: [
    'word',
    'language',
    'pronunciation',
    'category',
    'register',
    'connotation',
    'essence',
    'explanation',
    'contrast',
    'synonyms',
    'collocations',
    'usage',
    'curiosity',
    'meanings',
  ],
  additionalProperties: false,
} as const;

export function getLexicoonAiOptions(userId: string) {
  return {
    jsonSchema: LEXICOON_JSON_SCHEMA,
    maxTokens: 1600,
    schemaName: 'lexicoon_entry',
    userId,
  };
}

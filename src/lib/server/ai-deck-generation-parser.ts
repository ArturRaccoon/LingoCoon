import { normalizeLanguageCode } from '@/lib/languages';
import { extractJsonObject } from '@/lib/server/ai-json';
import { generatedDeckSchema } from '@/lib/server/ai-deck-generation-schema';
import type { GeneratedDeck } from '@/types/ai-deck';

export class InvalidGeneratedDeckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidGeneratedDeckError';
  }
}

export function parseGeneratedDeck(rawResponse: string): GeneratedDeck {
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonObject(rawResponse));
  } catch {
    throw new InvalidGeneratedDeckError('The AI returned an unreadable response. Please try again.');
  }

  const result = generatedDeckSchema.safeParse(normalizeGeneratedDeck(parsed));
  if (!result.success) {
    console.error(
      '[parseGeneratedDeck] Invalid fields:',
      result.error.issues.map((issue) => issue.path.join('.') || 'deck'),
    );
    throw new InvalidGeneratedDeckError('The AI response had an unexpected format. Please try again.');
  }

  return {
    title: result.data.title,
    language_from: result.data.language_from,
    language_to: result.data.language_to,
    cards: result.data.cards.map((card) => ({
      localId: crypto.randomUUID(),
      front: card.front,
      back: card.back,
      example_sentence: card.example_sentence,
    })),
  };
}

function normalizeGeneratedDeck(value: unknown): unknown {
  if (!isRecord(value)) return value;

  const deck = isRecord(value.deck) ? value.deck : value;
  const cards = getFirstArray(deck, ['cards', 'flashcards']);

  return {
    title: getFirstString(deck, ['title', 'name']),
    language_from: normalizeGeneratedLanguage(getFirstString(deck, ['language_from', 'languageFrom'])),
    language_to: normalizeGeneratedLanguage(getFirstString(deck, ['language_to', 'languageTo'])),
    cards: cards?.map(normalizeGeneratedCard),
  };
}

function normalizeGeneratedCard(value: unknown): unknown {
  if (!isRecord(value)) return value;

  return {
    front: getFirstString(value, ['front', 'term', 'word', 'question', 'source']),
    back: getFirstString(value, ['back', 'translation', 'meaning', 'definition', 'answer']),
    example_sentence:
      getFirstString(value, ['example_sentence', 'exampleSentence', 'example']) ?? null,
  };
}

function normalizeGeneratedLanguage(value: string | undefined): string | undefined {
  return value ? normalizeLanguageCode(value) : value;
}

function getFirstString(
  value: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    if (typeof value[key] === 'string') return value[key];
  }

  return undefined;
}

function getFirstArray(
  value: Record<string, unknown>,
  keys: string[],
): unknown[] | undefined {
  for (const key of keys) {
    if (Array.isArray(value[key])) return value[key];
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

import type { SupabaseClient } from '@supabase/supabase-js';
import { buildAiStudySystemPrompt } from '@/lib/ai-study';
import { buildGeneralChatSystemPrompt } from '@/lib/chat-prompts';
import { normalizeLanguageCode } from '@/lib/languages';
import { InvalidAiRequestError } from '@/lib/server/ai-validation';
import { loadOwnedDeck, loadStudyCards } from '@/lib/server/deck-data';
import { buildClassicStudyTutorPrompt, buildDeckStudyTutorPrompt } from '@/lib/study-prompts';
import { getLanguageProfile } from '@/lib/supabase/profile';
import type { Database } from '@/lib/supabase/types';
import type { TutorConversationRequest } from '@/types/ai';
import type { SessionCard } from '@/types/study';

const SUPPORTED_PROMPT_LANGUAGES = new Set([
  'ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'uk', 'zh',
]);

interface ResolvedTutorContext {
  context: unknown;
  systemPrompt: string;
}

export async function resolveTutorContext(
  request: TutorConversationRequest,
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ResolvedTutorContext> {
  if (request.operation === 'general_chat') {
    const profile = await getLanguageProfile(supabase, userId);
    const nativeLanguage = getTrustedLanguage(profile.nativeLanguage, 'en');
    const targetLanguage = profile.targetLanguage
      ? getTrustedLanguage(profile.targetLanguage)
      : null;

    return {
      systemPrompt: buildGeneralChatSystemPrompt(nativeLanguage, targetLanguage),
      context: { operation: request.operation },
    };
  }

  const { deck, error: deckError } = await loadOwnedDeck(supabase, userId, request.deckId);
  if (deckError || !deck) {
    throw new InvalidAiRequestError('Study context is unavailable.');
  }

  const cardResult = await loadStudyCards(supabase, deck.id, 'all');
  if (cardResult.error) {
    throw new InvalidAiRequestError('Study context is unavailable.');
  }

  const nativeLanguage = await getNativeLanguageForPrompt(supabase, userId);

  if (request.operation === 'classic_study') {
    const card = requireCard(cardResult.cards, request.cardId);

    return {
      systemPrompt: buildClassicStudyTutorPrompt(nativeLanguage),
      context: buildClassicCardContext(card),
    };
  }

  const studyingLanguage = getTrustedLanguage(deck.language_from);

  if (request.operation === 'deck_study') {
    const card = requireCard(cardResult.cards, request.cardId);

    return {
      systemPrompt: buildDeckStudyTutorPrompt(studyingLanguage, nativeLanguage),
      context: buildDeckCardContext(card),
    };
  }

  const cardsById = new Map(cardResult.cards.map((card) => [card.id, card]));
  const selectedCards = request.cardIds.map((cardId) => cardsById.get(cardId));
  if (selectedCards.some((card) => !card)) {
    throw new InvalidAiRequestError('Study context is unavailable.');
  }

  const cards = selectedCards as SessionCard[];
  const languageTo = getTrustedLanguage(deck.language_to);

  return {
    systemPrompt: buildAiStudySystemPrompt(
      studyingLanguage,
      languageTo,
      nativeLanguage,
      cards.length,
    ),
    context: {
      operation: request.operation,
      deck: { title: deck.title },
      cards: cards.map(buildAiStudyCardContext),
    },
  };
}

async function getNativeLanguageForPrompt(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string> {
  const { nativeLanguage } = await getLanguageProfile(supabase, userId);
  return getTrustedLanguage(nativeLanguage, 'en');
}

function getTrustedLanguage(value: string | null, fallback?: string): string {
  if (value) {
    const normalized = normalizeLanguageCode(value);
    if (SUPPORTED_PROMPT_LANGUAGES.has(normalized)) return normalized;
  }

  if (fallback) return fallback;
  throw new InvalidAiRequestError('Unsupported language configuration.');
}

function requireCard(cards: SessionCard[], cardId: string): SessionCard {
  const card = cards.find((candidate) => candidate.id === cardId);
  if (!card) throw new InvalidAiRequestError('Study context is unavailable.');

  return card;
}

function buildClassicCardContext(card: SessionCard) {
  return {
    operation: 'classic_study',
    currentCard: {
      front: card.front,
      back: card.back,
      exampleSentence: card.exampleSentence,
      pronunciation: card.pronunciation,
      repetitions: card.repetitions ?? 0,
      intervalDays: card.interval ?? 0,
    },
  };
}

function buildDeckCardContext(card: SessionCard) {
  return {
    operation: 'deck_study',
    currentCard: {
      front: card.front,
      back: card.back,
    },
  };
}

function buildAiStudyCardContext(card: SessionCard, index: number) {
  return {
    index: index + 1,
    front: card.front,
    back: card.back,
    exampleSentence: card.exampleSentence,
    isNew: !card.repetitions,
    repetitions: card.repetitions ?? 0,
  };
}

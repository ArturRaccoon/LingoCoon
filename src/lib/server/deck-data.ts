import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import { validateFlashcardText } from '@/lib/validation';
import type { Database } from '@/lib/supabase/types';
import type { StudyProgress } from '@/lib/supabase/types';
import type { Card, Deck } from '@/lib/supabase/types';
import type { SessionCard } from '@/types/study';

export type ServerSupabaseClient = SupabaseClient<Database>;

type StudyProgressSummary = Pick<
  StudyProgress,
  'ease_factor' | 'interval' | 'repetitions' | 'next_review_date'
>;

interface StudyCardRow {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  example_sentence: string | null;
  pronunciation: string | null;
  study_progress: StudyProgressSummary[] | null;
}

const STUDY_CARD_SELECT = `
  id,
  deck_id,
  front,
  back,
  example_sentence,
  pronunciation,
  study_progress (
    ease_factor,
    interval,
    repetitions,
    next_review_date
  )
`;

export async function userOwnsDeck(
  supabase: ServerSupabaseClient,
  userId: string,
  deckId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('decks')
    .select('id')
    .eq('id', deckId)
    .eq('user_id', userId)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function loadOwnedDeckWithCards(
  supabase: ServerSupabaseClient,
  userId: string,
  deckId: string,
): Promise<{ deck: Deck | null; cards: Card[]; error?: string }> {
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', userId)
    .maybeSingle();

  if (deckError) return { deck: null, cards: [], error: deckError.message };
  if (!deck) return { deck: null, cards: [] };

  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false });

  return cardsError
    ? { deck, cards: [], error: cardsError.message }
    : { deck, cards: cards ?? [] };
}

export async function loadOwnedDeck(
  supabase: ServerSupabaseClient,
  userId: string,
  deckId: string,
): Promise<{ deck: Deck | null; error?: string }> {
  const { data: deck, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', userId)
    .maybeSingle();

  return error ? { deck: null, error: error.message } : { deck };
}

type ValidatedCard = { front: string; back: string };
type CardValidationError = { error: string };

export function validateCard(front: unknown, back: unknown): ValidatedCard | CardValidationError {
  const frontResult = validateFlashcardText(front);
  if (!frontResult.isValid) return { error: frontResult.error };

  const backResult = validateFlashcardText(back);
  if (!backResult.isValid) return { error: backResult.error };

  return { front: frontResult.value, back: backResult.value };
}

export function revalidateDeckPages(deckId?: string) {
  revalidatePath('/dashboard');
  revalidatePath('/decks');

  if (deckId) {
    revalidatePath(`/decks/${deckId}`);
  }
}

export async function loadStudyCards(
  supabase: ServerSupabaseClient,
  deckId: string,
  scope: 'due' | 'all',
): Promise<{ cards: SessionCard[]; error?: string }> {
  let query = supabase
    .from('cards')
    .select(STUDY_CARD_SELECT)
    .eq('deck_id', deckId);

  if (scope === 'all') {
    query = query.order('created_at');
  }

  const { data, error } = await query;
  if (error) return { cards: [], error: error.message };

  const now = new Date().toISOString();
  const rows = scope === 'due'
    ? (data ?? []).filter((card) => {
        const progress = getStudyProgress(card);
        return !progress || progress.next_review_date <= now;
      })
    : (data ?? []);

  return { cards: rows.map(mapStudyCard) };
}

function getStudyProgress(card: StudyCardRow): StudyProgressSummary | null {
  return card.study_progress?.[0] ?? null;
}

function mapStudyCard(card: StudyCardRow): SessionCard {
  const progress = getStudyProgress(card);

  return {
    id: card.id,
    deckId: card.deck_id,
    front: card.front,
    back: card.back,
    exampleSentence: card.example_sentence ?? null,
    pronunciation: card.pronunciation ?? null,
    easeFactor: progress?.ease_factor ?? null,
    interval: progress?.interval ?? null,
    repetitions: progress?.repetitions ?? null,
    nextReviewDate: progress?.next_review_date ?? null,
    isFlipped: false,
  };
}

'use server';

import {
  revalidateDeckPages,
  validateCard,
} from '@/lib/server/deck-data';
import { getCurrentUser } from '@/lib/supabase/auth';
import type { DeckWithCardCount } from '@/lib/supabase/types';
import {
  normalizeExampleSentence,
  validateDeckInput,
} from '@/lib/actions/deck/validation';

interface BulkCardInput {
  example_sentence?: string | null;
  front: string;
  back: string;
}

export async function createDeckWithCards(
  title: string,
  languageFrom: string,
  languageTo: string,
  cards: ReadonlyArray<BulkCardInput>,
): Promise<{ deck?: DeckWithCardCount; error?: string }> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const deckInput = validateDeckInput(title, languageFrom, languageTo);
  if ('error' in deckInput) return deckInput;
  if (!Array.isArray(cards) || cards.length === 0) return { error: 'At least one card is required.' };
  if (cards.length > 100) return { error: 'Maximum 100 cards per deck.' };

  const rows = [];
  for (const input of cards) {
    const card = validateCard(input?.front, input?.back);
    if ('error' in card) return { error: `Card validation failed: ${card.error}` };

    const exampleSentence = normalizeExampleSentence(input?.example_sentence);
    if ('error' in exampleSentence) return exampleSentence;

    rows.push({ ...card, example_sentence: exampleSentence.value });
  }

  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .insert({ ...deckInput, user_id: user.id })
    .select()
    .single();

  if (deckError || !deck) return { error: deckError?.message ?? 'Failed to create deck.' };

  const { error: cardsError } = await supabase
    .from('cards')
    .insert(rows.map((card) => ({ ...card, deck_id: deck.id })));

  if (cardsError) {
    // Supabase JS has no transaction wrapper. Remove the deck if its card insert fails.
    await supabase.from('decks').delete().eq('id', deck.id).eq('user_id', user.id);
    return { error: cardsError.message };
  }

  revalidateDeckPages();
  return { deck: { ...deck, card_count: rows.length } };
}

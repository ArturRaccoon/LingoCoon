'use server';

import {
  revalidateDeckPages,
} from '@/lib/server/deck-data';
import { getCurrentUser } from '@/lib/supabase/auth';
import type { Deck, DeckWithCardCount } from '@/lib/supabase/types';
import { validateDeckInput } from '@/lib/actions/deck/validation';

export async function createDeck(
  title: string,
  languageFrom: string,
  languageTo: string,
): Promise<{ deck?: DeckWithCardCount; error?: string }> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const deckInput = validateDeckInput(title, languageFrom, languageTo);
  if ('error' in deckInput) return deckInput;

  const { data, error } = await supabase
    .from('decks')
    .insert({ ...deckInput, user_id: user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidateDeckPages();
  return { deck: { ...data, card_count: 0 } };
}

export async function getDecks(): Promise<{ decks: DeckWithCardCount[] }> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { decks: [] };

  const { data, error } = await supabase
    .from('decks')
    .select('*, cards(count)')
    .eq('user_id', user.id)
    .order('created_at');

  if (error) return { decks: [] };

  return {
    decks: (data ?? []).map(({ cards, ...deck }) => ({
      ...deck,
      card_count: cards?.[0]?.count ?? 0,
    })),
  };
}

export async function getDeck(deckId: string): Promise<{ deck: Deck | null }> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { deck: null };

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', user.id)
    .eq('id', deckId)
    .single();

  return { deck: error ? null : data };
}

export async function deleteDeck(deckId: string): Promise<{ error?: string }> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidateDeckPages();
  return {};
}

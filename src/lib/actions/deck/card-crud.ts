'use server';

import {
  revalidateDeckPages,
  userOwnsDeck,
  validateCard,
} from '@/lib/server/deck-data';
import { getCurrentUser } from '@/lib/supabase/auth';
import type { Card } from '@/lib/supabase/types';

export async function getCards(deckId: string): Promise<{ cards: Card[]; error?: string }> {
  const { supabase, user } = await getCurrentUser();
  if (!user || !await userOwnsDeck(supabase, user.id, deckId)) return { cards: [] };

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at');

  return error ? { cards: [], error: error.message } : { cards: data ?? [] };
}

export async function createCard(
  deckId: string,
  front: string,
  back: string,
): Promise<{ card?: Card; error?: string }> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };
  if (!await userOwnsDeck(supabase, user.id, deckId)) return { error: 'Deck not found' };

  const card = validateCard(front, back);
  if ('error' in card) return card;

  const { data, error } = await supabase
    .from('cards')
    .insert({ deck_id: deckId, ...card })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidateDeckPages(deckId);
  return { card: data };
}

export async function updateCard(
  cardId: string,
  deckId: string,
  front: string,
  back: string,
): Promise<{ card?: Card; error?: string }> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };
  if (!await userOwnsDeck(supabase, user.id, deckId)) return { error: 'Deck not found' };

  const card = validateCard(front, back);
  if ('error' in card) return card;

  const { data, error } = await supabase
    .from('cards')
    .update(card)
    .eq('id', cardId)
    .eq('deck_id', deckId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidateDeckPages(deckId);
  return { card: data };
}

export async function deleteCard(cardId: string, deckId: string): Promise<{ error?: string }> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };
  if (!await userOwnsDeck(supabase, user.id, deckId)) return { error: 'Deck not found' };

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)
    .eq('deck_id', deckId);

  if (error) return { error: error.message };

  revalidateDeckPages(deckId);
  return {};
}

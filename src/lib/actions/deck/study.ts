'use server';

import { Rating } from 'ts-fsrs';
import {
  loadStudyCards,
  userOwnsDeck,
} from '@/lib/server/deck-data';
import { scheduleCardReview } from '@/lib/server/study-scheduler';
import type { ReviewRating } from '@/lib/server/study-scheduler';
import { getCurrentUser } from '@/lib/supabase/auth';
import type { SessionCard } from '@/types/study';

export async function getCardsForStudy(
  deckId: string,
): Promise<{ cards: SessionCard[]; error?: string }> {
  return getOwnedStudyCards(deckId, 'due');
}

export async function getCardsForStudyAll(
  deckId: string,
): Promise<{ cards: SessionCard[]; error?: string }> {
  return getOwnedStudyCards(deckId, 'all');
}

export async function rateCard(cardId: string, rating: Rating): Promise<{ error?: string }> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };
  if (!isReviewRating(rating)) {
    return { error: 'Invalid card rating' };
  }

  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('deck_id')
    .eq('id', cardId)
    .maybeSingle();

  if (cardError) return { error: cardError.message };
  if (!card || !await userOwnsDeck(supabase, user.id, card.deck_id)) {
    return { error: 'Card not found' };
  }

  const { data: existing, error: progressError } = await supabase
    .from('study_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('card_id', cardId)
    .maybeSingle();

  if (progressError) return { error: progressError.message };

  const { error } = await supabase
    .from('study_progress')
    .upsert(
      {
        user_id: user.id,
        card_id: cardId,
        ...scheduleCardReview(existing, rating),
      },
      { onConflict: 'user_id,card_id' },
    );

  if (error) {
    console.error('[rateCard] Failed to save study progress:', {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
    });
    return { error: error.message };
  }

  return {};
}

async function getOwnedStudyCards(deckId: string, scope: 'due' | 'all') {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { cards: [], error: 'Unauthorized' };
  if (!await userOwnsDeck(supabase, user.id, deckId)) {
    return { cards: [], error: 'Deck not found' };
  }

  return loadStudyCards(supabase, deckId, scope);
}

function isReviewRating(rating: Rating): rating is ReviewRating {
  return (
    rating === Rating.Again ||
    rating === Rating.Hard ||
    rating === Rating.Good ||
    rating === Rating.Easy
  );
}

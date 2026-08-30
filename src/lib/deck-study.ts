import { Rating } from 'ts-fsrs';
import type { Card, Deck } from '@/lib/supabase/types';
import type { DeckStudyRating } from '@/types/study';

export interface DeckStudyDisplayCard {
  back: string;
  backLanguage: string;
  front: string;
  frontLanguage: string;
}

export function getDeckStudyDisplayCard(
  card: Card | undefined,
  deck: Deck,
  nativeLanguage: string,
): DeckStudyDisplayCard {
  const shouldSwapSides =
    deck.language_from === nativeLanguage && deck.language_from !== deck.language_to;

  return {
    front: shouldSwapSides ? card?.back ?? '' : card?.front ?? '',
    back: shouldSwapSides ? card?.front ?? '' : card?.back ?? '',
    frontLanguage: shouldSwapSides ? deck.language_to : deck.language_from,
    backLanguage: shouldSwapSides ? deck.language_from : deck.language_to,
  };
}

export function getHardStudyCards(
  cards: Card[],
  ratings: Record<string, DeckStudyRating>,
): Card[] {
  return cards.filter((card) => ratings[card.id] === 'again' || ratings[card.id] === 'hard');
}

export function toFsrsRating(rating: DeckStudyRating): Rating {
  switch (rating) {
    case 'again':
      return Rating.Again;
    case 'hard':
      return Rating.Hard;
    case 'good':
      return Rating.Good;
    case 'easy':
      return Rating.Easy;
  }
}

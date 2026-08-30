export interface SessionCard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  exampleSentence: string | null;
  pronunciation: string | null;
  easeFactor: number | null;
  interval: number | null;
  repetitions: number | null;
  nextReviewDate: string | null;
  isFlipped: boolean;
}

export type DeckStudyRating = 'again' | 'hard' | 'good' | 'easy';

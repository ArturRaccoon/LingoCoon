import type { GeneratedCard, GeneratedDeck } from '@/types/ai-deck';

export interface CardDraft {
  front: string;
  back: string;
  example_sentence: string;
}

export const EMPTY_CARD_DRAFT: CardDraft = {
  front: '',
  back: '',
  example_sentence: '',
};

export function createEmptyCardDraft(): CardDraft {
  return { ...EMPTY_CARD_DRAFT };
}

export function createCardDraft(card: GeneratedCard): CardDraft {
  return {
    front: card.front,
    back: card.back,
    example_sentence: card.example_sentence ?? '',
  };
}

export function canSaveCardDraft(draft: CardDraft): boolean {
  return draft.front.trim().length > 0 && draft.back.trim().length > 0;
}

export function updateGeneratedCard(
  deck: GeneratedDeck,
  cardId: string,
  draft: CardDraft,
): GeneratedDeck {
  return {
    ...deck,
    cards: deck.cards.map((card) =>
      card.localId === cardId
        ? {
            ...card,
            front: draft.front.trim() || card.front,
            back: draft.back.trim() || card.back,
            example_sentence: draft.example_sentence.trim() || null,
          }
        : card,
    ),
  };
}

export function removeGeneratedCard(deck: GeneratedDeck, cardId: string): GeneratedDeck {
  return {
    ...deck,
    cards: deck.cards.filter((card) => card.localId !== cardId),
  };
}

export function addGeneratedCard(deck: GeneratedDeck, draft: CardDraft): GeneratedDeck {
  return {
    ...deck,
    cards: [
      ...deck.cards,
      {
        localId: crypto.randomUUID(),
        front: draft.front.trim(),
        back: draft.back.trim(),
        example_sentence: draft.example_sentence.trim() || null,
      },
    ],
  };
}

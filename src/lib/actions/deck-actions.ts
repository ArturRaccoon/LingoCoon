'use server';

import { Rating } from 'ts-fsrs';
import {
  createDeck as createDeckAction,
  deleteDeck as deleteDeckAction,
  getDeck as getDeckAction,
  getDecks as getDecksAction,
} from '@/lib/actions/deck/deck-crud';
import {
  createCard as createCardAction,
  deleteCard as deleteCardAction,
  getCards as getCardsAction,
  updateCard as updateCardAction,
} from '@/lib/actions/deck/card-crud';
import { createDeckWithCards as createDeckWithCardsAction } from '@/lib/actions/deck/bulk-create';
import {
  getCardsForStudy as getCardsForStudyAction,
  getCardsForStudyAll as getCardsForStudyAllAction,
  rateCard as rateCardAction,
} from '@/lib/actions/deck/study';

export async function createDeck(title: string, languageFrom: string, languageTo: string) {
  return createDeckAction(title, languageFrom, languageTo);
}

export async function getDecks() {
  return getDecksAction();
}

export async function getDeck(deckId: string) {
  return getDeckAction(deckId);
}

export async function deleteDeck(deckId: string) {
  return deleteDeckAction(deckId);
}

export async function getCards(deckId: string) {
  return getCardsAction(deckId);
}

export async function createCard(deckId: string, front: string, back: string) {
  return createCardAction(deckId, front, back);
}

export async function updateCard(
  cardId: string,
  deckId: string,
  front: string,
  back: string,
) {
  return updateCardAction(cardId, deckId, front, back);
}

export async function deleteCard(cardId: string, deckId: string) {
  return deleteCardAction(cardId, deckId);
}

export async function getCardsForStudy(deckId: string) {
  return getCardsForStudyAction(deckId);
}

export async function getCardsForStudyAll(deckId: string) {
  return getCardsForStudyAllAction(deckId);
}

export async function rateCard(cardId: string, rating: Rating) {
  return rateCardAction(cardId, rating);
}

export async function createDeckWithCards(
  title: string,
  languageFrom: string,
  languageTo: string,
  cards: ReadonlyArray<{ front: string; back: string; example_sentence?: string | null }>,
) {
  return createDeckWithCardsAction(title, languageFrom, languageTo, cards);
}

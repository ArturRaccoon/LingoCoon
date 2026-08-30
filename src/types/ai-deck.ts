/**
 * Types for the AI deck generation flow.
 *
 * These types describe deck and card data BEFORE it is persisted to the database.
 * They are used exclusively in the generation preview UI and the generateFlashcardDeckWithAi action.
 *
 * Key distinction:
 *   GeneratedCard.localId  → client-side UUID for React keying only, never stored in DB.
 *   Card.id                → database UUID assigned by Supabase on insert.
 */

/**
 * A single card in the AI-generated preview.
 * Not yet saved to the database.
 */
export interface GeneratedCard {
  /** Client-side UUID for React list keying. Never sent to the database. */
  localId: string;
  front: string;
  back: string;
  example_sentence: string | null;
}

/**
 * The complete deck returned by the AI generation Server Action.
 * Not yet persisted — the user reviews and edits it before saving.
 */
export interface GeneratedDeck {
  title: string;
  /** ISO 639-1 code of the language on card fronts (e.g. 'fr', 'it'). */
  language_from: string;
  /** ISO 639-1 code of the language on card backs. */
  language_to: string;
  cards: GeneratedCard[];
}

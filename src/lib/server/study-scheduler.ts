import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  type Card as FsrsCard,
  type RecordLogItem,
} from 'ts-fsrs';
import type { StudyProgress } from '@/lib/supabase/types';

export type ReviewRating = Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;

const MIN_LEGACY_EASE_FACTOR = 1.3;
const MAX_LEGACY_EASE_FACTOR = 2.5;
const DEFAULT_LEGACY_EASE_FACTOR = 2.5;
const MIN_LEGACY_INTERVAL_DAYS = 1;

export function scheduleCardReview(existing: StudyProgress | null, rating: ReviewRating) {
  const now = new Date();
  const scheduler = fsrs(generatorParameters());
  const baseCard = existing ? restoreFsrsCard(existing, now) : createEmptyCard(now);
  const entry = scheduler.repeat(baseCard, now)[rating] as RecordLogItem;

  return {
    ease_factor: getNextLegacyEaseFactor(existing?.ease_factor, rating),
    interval: toLegacyInterval(entry.card.scheduled_days),
    repetitions: entry.card.reps,
    next_review_date: entry.card.due.toISOString(),
  };
}

function restoreFsrsCard(existing: StudyProgress, now: Date): FsrsCard {
  return {
    ...createEmptyCard(now),
    due: new Date(existing.next_review_date),
    stability: toLegacyEaseFactor(existing.ease_factor),
    // Persist difficulty and last_review in a schema migration before tuning FSRS.
    difficulty: 5,
    elapsed_days: existing.interval,
    scheduled_days: existing.interval,
    reps: existing.repetitions,
    lapses: 0,
    state: existing.repetitions === 0 ? 0 : 2,
    last_review: now,
  };
}

function toLegacyEaseFactor(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_LEGACY_EASE_FACTOR;
  }

  return Math.min(Math.max(value, MIN_LEGACY_EASE_FACTOR), MAX_LEGACY_EASE_FACTOR);
}

function getNextLegacyEaseFactor(currentEaseFactor: number | undefined, rating: ReviewRating) {
  const current = toLegacyEaseFactor(currentEaseFactor ?? DEFAULT_LEGACY_EASE_FACTOR);

  switch (rating) {
    case Rating.Again:
      return toLegacyEaseFactor(current - 0.2);
    case Rating.Hard:
      return toLegacyEaseFactor(current - 0.15);
    case Rating.Good:
      return current;
    case Rating.Easy:
      return toLegacyEaseFactor(current + 0.15);
  }
}

function toLegacyInterval(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_LEGACY_INTERVAL_DAYS;
  }

  return Math.max(Math.round(value), MIN_LEGACY_INTERVAL_DAYS);
}

'use client';

import { useCallback, useRef, useState } from 'react';
import type { Rating } from 'ts-fsrs';
import { rateCard } from '@/lib/actions/deck-actions';

interface PendingRating {
  cardId: string;
  rating: Rating;
}

export function useAiStudyRatingPersistence() {
  const [hasPendingRating, setHasPendingRating] = useState(false);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const pendingRatingRef = useRef<PendingRating | null>(null);
  const savePromiseRef = useRef<Promise<boolean> | null>(null);
  const savedCardIdsRef = useRef(new Set<string>());

  const savePendingRating = useCallback((): Promise<boolean> => {
    if (savePromiseRef.current) return savePromiseRef.current;

    const savePromise = (async () => {
      const pendingRating = pendingRatingRef.current;
      if (!pendingRating) return true;

      setIsSavingRating(true);

      try {
        const result = await rateCard(pendingRating.cardId, pendingRating.rating);
        if (result.error) throw new Error(result.error);

        savedCardIdsRef.current.add(pendingRating.cardId);
        pendingRatingRef.current = null;
        setHasPendingRating(false);
        return true;
      } catch (error) {
        console.error('[AI Study] Failed to save card rating:', error);
        return false;
      } finally {
        setIsSavingRating(false);
      }
    })();

    savePromiseRef.current = savePromise;
    void savePromise.finally(() => {
      savePromiseRef.current = null;
    });

    return savePromise;
  }, []);

  const saveRating = useCallback(async (cardId: string, rating: Rating) => {
    if (savedCardIdsRef.current.has(cardId)) return true;

    pendingRatingRef.current = { cardId, rating };
    setHasPendingRating(true);
    return savePendingRating();
  }, [savePendingRating]);

  const skipPendingRating = useCallback(() => {
    const pendingRating = pendingRatingRef.current;
    if (!pendingRating) return;

    console.error(`[AI Study] Skipped unsaved rating for card ${pendingRating.cardId}.`);
    pendingRatingRef.current = null;
    setHasPendingRating(false);
  }, []);

  return {
    hasPendingRating,
    isSavingRating,
    retryPendingRating: savePendingRating,
    saveRating,
    skipPendingRating,
  };
}

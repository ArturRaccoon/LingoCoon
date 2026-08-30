'use client';

import { useTranslation } from 'react-i18next';
import { Rating } from 'ts-fsrs';
import type { SessionCard } from '@/types/study';

interface ClassicStudyCardProps {
  card: SessionCard;
  deckLanguage: string;
  isFlipped: boolean;
  isRating: boolean;
  onFlip: () => void;
  onRate: (rating: Rating) => void;
  ratingError: string | null;
}

const RATINGS: Array<{
  color: string;
  rating: Rating;
  translationKey: string;
}> = [
  { translationKey: 'study.ratings.again', rating: Rating.Again, color: 'text-red-500' },
  { translationKey: 'study.ratings.hard', rating: Rating.Hard, color: 'text-yellow-500' },
  { translationKey: 'study.ratings.good', rating: Rating.Good, color: 'text-gray-900' },
  { translationKey: 'study.ratings.easy', rating: Rating.Easy, color: 'text-green-500' },
];

export function ClassicStudyCard({
  card,
  deckLanguage,
  isFlipped,
  isRating,
  onFlip,
  onRate,
  ratingError,
}: ClassicStudyCardProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 flex min-h-56 flex-col justify-center rounded-2xl border border-gray-200 bg-gray-50 p-8">
        <p className="mb-2 text-center text-2xl font-bold text-gray-900">{card.front}</p>
        <p className="text-center text-xs uppercase tracking-widest text-gray-400">{deckLanguage}</p>

        {isFlipped && (
          <div className="mt-6 space-y-2 border-t border-gray-200 pt-6 text-center">
            <p className="text-xl text-gray-800">{card.back}</p>
            {card.pronunciation && (
              <p className="text-sm italic text-gray-500">{card.pronunciation}</p>
            )}
            {card.exampleSentence && (
              <p className="mt-2 text-sm text-gray-600">&quot;{card.exampleSentence}&quot;</p>
            )}
          </div>
        )}
      </div>

      {!isFlipped ? (
        <button
          onClick={onFlip}
          className="w-full rounded-xl bg-gray-900 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
        >
          {t('study.show_answer')}
        </button>
      ) : (
        <div className="flex items-center justify-around pt-2">
          {RATINGS.map((rating) => (
            <button
              key={rating.translationKey}
              onClick={() => onRate(rating.rating)}
              disabled={isRating}
              className={`${rating.color} text-sm font-semibold transition-opacity hover:opacity-70 disabled:opacity-40`}
            >
              {t(rating.translationKey)}
            </button>
          ))}
        </div>
      )}

      {ratingError && (
        <p className="mt-4 text-center text-sm text-red-600">{ratingError}</p>
      )}
    </div>
  );
}

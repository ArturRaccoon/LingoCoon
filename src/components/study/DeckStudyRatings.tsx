'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { DeckStudyRating } from '@/types/study';

export type CardRating = DeckStudyRating;

interface DeckStudyRatingsProps {
  disabled: boolean;
  onRate: (rating: CardRating) => void;
}

const RATINGS: Array<{
  color: string;
  translationKey: string;
  value: CardRating;
}> = [
  { value: 'again', translationKey: 'study_session.evaluation.forgot', color: 'text-red-500' },
  { value: 'hard', translationKey: 'study_session.evaluation.hard', color: 'text-yellow-500' },
  { value: 'good', translationKey: 'study_session.evaluation.good', color: 'text-gray-900' },
  { value: 'easy', translationKey: 'study_session.evaluation.easy', color: 'text-green-500' },
];

export function DeckStudyRatings({ disabled, onRate }: DeckStudyRatingsProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-4 flex items-center justify-around py-2"
    >
      {RATINGS.map((rating) => (
        <button
          key={rating.value}
          onClick={() => onRate(rating.value)}
          disabled={disabled}
          className={`${rating.color} text-sm font-semibold transition-opacity hover:opacity-70 disabled:opacity-40`}
        >
          {t(rating.translationKey)}
        </button>
      ))}
    </motion.div>
  );
}

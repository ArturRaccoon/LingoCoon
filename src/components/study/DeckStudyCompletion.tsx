'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Card } from '@/lib/supabase/types';

export interface DeckStudySessionStats {
  hardCards: Card[];
}

interface DeckStudyCompletionProps {
  deckId: string;
  deckTitle: string;
  stats: DeckStudySessionStats | null;
  onStudyAgain: () => void;
}

export function DeckStudyCompletion({
  deckId,
  deckTitle,
  stats,
  onStudyAgain,
}: DeckStudyCompletionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-4 text-6xl"
          >
            🎉
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('study_session.completed.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{deckTitle}</p>
        </div>

        {stats ? (
          <div className="mb-6">
            {stats.hardCards.length > 0 ? (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {t('study_session.completed.review_again')} - {stats.hardCards.length}
                </p>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {stats.hardCards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-gray-900">{card.front}</p>
                      <p className="mt-1 text-xs text-gray-500">{card.back}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-5 text-center">
                <p className="mb-2 text-3xl">⭐</p>
                <p className="font-semibold text-gray-900">{t('study_session.completed.all_easy')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 space-y-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={onStudyAgain}
            className="w-full rounded-xl bg-gray-900 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
          >
            {t('study_session.completed.study_again')}
          </button>
          <Link
            href={`/decks/${deckId}`}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 text-center font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {t('decks.back_to_deck')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

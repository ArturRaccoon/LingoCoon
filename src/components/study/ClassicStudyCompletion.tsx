'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface ClassicStudyCompletionProps {
  cardCount: number;
  deckId: string;
}

export function ClassicStudyCompletion({ cardCount, deckId }: ClassicStudyCompletionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('study.session_complete_title')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('study.session_complete_subtitle', { count: cardCount })}
        </p>
        <Link
          href={`/decks/${deckId}`}
          className="mt-4 inline-block rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          {t('study.back_to_deck')}
        </Link>
      </div>
    </div>
  );
}

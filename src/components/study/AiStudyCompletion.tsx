'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface AiStudyCompletionProps {
  cardCount: number;
  deckId: string;
}

export function AiStudyCompletion({ cardCount, deckId }: AiStudyCompletionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="space-y-6 px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('study.ai_mode.session_complete_title')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('study.ai_mode.session_complete_subtitle', { count: cardCount })}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/study/${deckId}`}
            className="inline-block rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            {t('study.ai_mode.retry_classic')}
          </Link>
          <Link
            href={`/decks/${deckId}`}
            className="inline-block rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
          >
            {t('study.ai_mode.back_to_deck')}
          </Link>
        </div>
      </div>
    </div>
  );
}

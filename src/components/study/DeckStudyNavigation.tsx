'use client';

import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BackToDeckProps {
  deckId: string;
}

interface DeckStudyNavigationProps {
  currentIndex: number;
  deckId: string;
  onRestart: () => void;
  totalCards: number;
}

export function BackToDeck({ deckId }: BackToDeckProps) {
  const { t } = useTranslation();

  return (
    <Link
      href={`/decks/${deckId}`}
      className="mb-6 flex items-center gap-2 text-sm text-gray-900 hover:text-gray-700 hover:underline"
    >
      <ArrowLeft className="h-4 w-4" />
      {t('decks.back_to_deck')}
    </Link>
  );
}

export function DeckStudyNavigation({
  currentIndex,
  deckId,
  onRestart,
  totalCards,
}: DeckStudyNavigationProps) {
  const { t } = useTranslation();
  const progressPercent = ((currentIndex + 1) / totalCards) * 100;

  return (
    <>
      <BackToDeck deckId={deckId} />
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm text-gray-600">
          <span>{t('study.progress', { current: currentIndex + 1, total: totalCards })}</span>
          <button
            onClick={onRestart}
            className="flex items-center gap-1 transition-colors hover:text-gray-900"
            title={t('study.restart')}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-gray-900 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </>
  );
}

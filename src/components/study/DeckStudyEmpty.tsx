'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { BackToDeck } from '@/components/study/DeckStudyNavigation';

interface DeckStudyEmptyProps {
  deckId: string;
}

export function DeckStudyEmpty({ deckId }: DeckStudyEmptyProps) {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6">
      <BackToDeck deckId={deckId} />
      <div className="py-20 text-center">
        <p className="text-xl text-gray-600">{t('study_session.empty_deck')}</p>
        <Link
          href={`/decks/${deckId}`}
          className="mt-4 inline-block rounded-lg bg-gray-900 px-6 py-2 text-white hover:bg-gray-800"
        >
          {t('study_session.add_cards')}
        </Link>
      </div>
    </div>
  );
}

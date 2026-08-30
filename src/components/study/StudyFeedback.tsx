'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export function DeckNotFound({ error }: { error?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-red-500 text-base">{error ?? t('study_session.deck_not_found')}</p>
    </div>
  );
}

/**
 * NoCardsDue — shown when there are no cards scheduled for review today.
 * Offers the user a button to study all cards in the deck anyway (free study mode).
 *
 * @param deckId - the deck's ID, used to build navigation links
 * @param mode   - 'classic' for the normal study route, 'ai' for the AI study route
 */
export function NoCardsDue({
  deckId,
  mode = 'classic',
}: {
  deckId: string;
  mode?: 'classic' | 'ai';
}) {
  const { t } = useTranslation();

  const studyAllHref =
    mode === 'ai'
      ? `/study/ai/${deckId}?mode=all`
      : `/study/${deckId}?mode=all`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <p className="text-4xl">✅</p>
        <h1 className="text-xl font-semibold text-gray-900">{t('study_session.no_cards_due')}</h1>
        <p className="text-gray-500 text-sm">{t('study_session.all_caught_up')}</p>

        {/* Free study: let the user study all cards regardless of the schedule */}
        <Link
          href={studyAllHref}
          className="inline-block mt-1 bg-black text-white px-5 py-2
                     rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          {t('study_session.study_all_cards')}
        </Link>

        <div>
          <Link
            href={`/decks/${deckId}`}
            className="inline-block mt-1 border border-gray-300 text-gray-600 px-5 py-2
                       rounded-xl text-sm hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            {t('decks.back_to_deck')}
          </Link>
        </div>
      </div>
    </div>
  );
}

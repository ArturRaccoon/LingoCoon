'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DeckWithCardCount } from '@/lib/supabase/types';

interface AiStudyDeckListProps {
  decks: DeckWithCardCount[];
}

export function AiStudyDeckList({ decks }: AiStudyDeckListProps) {
  const { t } = useTranslation();

  if (decks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-16 text-center">
        <BookOpen className="mb-4 h-10 w-10 text-gray-300" />
        <p className="mb-3 text-sm text-gray-500">{t('ai_page.no_decks')}</p>
        <Link
          href="/decks"
          className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-800"
        >
          {t('ai_page.create_first_deck')}
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full space-y-3 overflow-y-auto p-4">
      <p className="px-1 pb-1 text-xs text-gray-400">{t('ai_page.deck_hint')}</p>
      {decks.map((deck) => (
        <Link
          key={deck.id}
          href={`/study/ai/${deck.id}`}
          className="group flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-all hover:border-gray-300 hover:bg-gray-50"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-gray-800">
              {deck.title}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {deck.language_from.toUpperCase()} → {deck.language_to.toUpperCase()}
              {' · '}
              {deck.card_count === 1
                ? t('decks.card_count_single', { count: deck.card_count })
                : t('decks.card_count', { count: deck.card_count })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 opacity-0 transition-opacity group-hover:opacity-100">
              {t('ai_page.start')}
            </span>
            <ArrowRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-gray-600" />
          </div>
        </Link>
      ))}
    </div>
  );
}

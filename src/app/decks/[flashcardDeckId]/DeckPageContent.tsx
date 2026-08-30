'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DeckActionsMenu from '@/components/decks/DeckActionsMenu';
import CardItem from '@/components/flashcards/CardItem';
import CreateCardForm from '@/components/flashcards/CreateCardForm';
import AppShell from '@/components/layout/AppShell';
import type { Card, Deck } from '@/lib/supabase/types';

interface DeckPageContentProps {
  deck: Deck;
  cards: Card[];
  userEmail?: string;
}

export default function DeckPageContent({ deck, cards, userEmail }: DeckPageContentProps) {
  const { t } = useTranslation();

  return (
    <AppShell userEmail={userEmail}>
      <div className="container mx-auto max-w-6xl space-y-8 p-6">
        <header className="flex flex-col items-start justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
          <div className="flex-1">
            <Link
              href="/decks"
              className="mb-3 flex items-center gap-2 text-sm text-gray-900 hover:text-gray-700 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('decks.back_to_decks')}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{deck.title}</h1>
            <p className="mt-1 text-gray-500">
              {deck.language_from.toUpperCase()} → {deck.language_to.toUpperCase()}
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-3">
            {cards.length > 0 && (
              <>
                <StudyLink href={`/decks/${deck.id}/study`} label={t('decks.start_study')}>
                  <Play className="h-5 w-5" />
                </StudyLink>
                <StudyLink
                  href={`/study/ai/${deck.id}`}
                  label={t('decks.study_with_ai')}
                  ai
                >
                  <Sparkles className="h-5 w-5" />
                </StudyLink>
              </>
            )}
            <DeckActionsMenu deckId={deck.id} deckTitle={deck.title} />
          </div>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <section className="h-fit rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {t('flashcards.create_new')}
            </h2>
            <CreateCardForm
              deckId={deck.id}
              deckLanguage={deck.language_from}
              languageTo={deck.language_to}
            />
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center justify-between text-lg font-semibold text-gray-900">
              {t('decks.cards_in_deck')}
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                {cards.length}
              </span>
            </h2>
            {cards.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 text-center text-gray-400">
                <p className="mb-2 text-lg">{t('flashcards.empty_state')}</p>
                <p className="text-sm">{t('flashcards.empty_state_cta')}</p>
              </div>
            ) : (
              <div className="max-h-[700px] space-y-3 overflow-y-auto pr-2">
                {cards.map((card) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    deckId={deck.id}
                    deckLanguage={deck.language_from}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function StudyLink({
  href,
  label,
  ai = false,
  children,
}: {
  href: string;
  label: string;
  ai?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white shadow-lg ${
        ai
          ? 'bg-black transition-all hover:bg-gray-800'
          : 'bg-black hover:bg-gray-800'
      }`}
    >
      {children}
      {label}
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { Library, Play, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DeckWithCardCount } from '@/lib/supabase/types';

interface DeckGridProps {
  decks: DeckWithCardCount[];
  onCreateClick: () => void;
}

export function DeckGrid({ decks, onCreateClick }: DeckGridProps) {
  if (decks.length === 0) return <EmptyDeckGrid onCreateClick={onCreateClick} />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => <DeckGridCard key={deck.id} deck={deck} />)}
    </div>
  );
}

function EmptyDeckGrid({ onCreateClick }: { onCreateClick: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/20 bg-black/[0.02] py-16 dark:border-white/20 dark:bg-white/[0.02]">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black/5 dark:bg-white/5">
        <Library className="h-8 w-8 text-black/40 dark:text-white/40" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">{t('decks.empty.title')}</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-black/60 dark:text-white/60">
        {t('decks.empty.description')}
      </p>
      <Button
        onClick={onCreateClick}
        className="gap-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <Plus className="h-4 w-4" />
        {t('decks.empty.create_button')}
      </Button>
    </div>
  );
}

function DeckGridCard({ deck }: { deck: DeckWithCardCount }) {
  const { t } = useTranslation();
  const cardCount = deck.card_count ?? 0;

  return (
    <Card className="group relative overflow-hidden border-black/10 bg-white transition-all duration-300 hover:border-black/20 hover:shadow-lg dark:border-white/10 dark:bg-black dark:hover:border-white/20">
      <Link
        href={`/decks/${deck.id}`}
        aria-label={deck.title}
        className="absolute inset-0 z-10"
      />
      <CardContent className="relative p-5">
        <div className="mb-4">
          <h3 className="mb-1 text-lg font-semibold text-black dark:text-white">{deck.title}</h3>
          <p className="text-sm text-black/60 dark:text-white/60">
            {cardCount === 1
              ? t('decks.card_count_single', { count: cardCount })
              : t('decks.card_count', { count: cardCount })}
          </p>
        </div>

        <div className="relative z-20">
          <Button
            asChild
            className={cn(
              'w-full gap-2 bg-black text-white hover:bg-black/90',
              'transition-all duration-200 dark:bg-white dark:text-black dark:hover:bg-white/90',
            )}
          >
            <Link href={`/decks/${deck.id}/study`}>
              <Play className="h-4 w-4" />
              {t('decks.study')}
            </Link>
          </Button>
        </div>
      </CardContent>
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-1 bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-white/30" />
    </Card>
  );
}

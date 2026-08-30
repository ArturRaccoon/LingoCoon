'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CreateDeckDialog } from '@/components/decks/CreateDeckDialog';
import { DeckGrid } from '@/components/decks/DeckGrid';
import type { DeckWithCardCount } from '@/lib/supabase/types';

interface DecksContentProps {
  initialDecks: DeckWithCardCount[];
}

export default function DecksContent({ initialDecks }: DecksContentProps) {
  const { t } = useTranslation();
  const [decks, setDecks] = useState(initialDecks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white sm:text-3xl">
            {t('decks.title')}
          </h1>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">{t('decks.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            className="gap-2 border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-500 dark:hover:bg-gray-900"
          >
            <Link href="/decks/generate">
              <Sparkles className="h-4 w-4" />
              {t('decks.generate_with_ai')}
            </Link>
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            {t('decks.create_new')}
          </Button>
        </div>
      </div>

      <DeckGrid decks={decks} onCreateClick={() => setIsDialogOpen(true)} />

      {isDialogOpen && (
        <CreateDeckDialog
          onClose={() => setIsDialogOpen(false)}
          onCreated={(deck) => {
            setDecks((previous) => [deck, ...previous]);
            setIsDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}

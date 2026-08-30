import { notFound } from 'next/navigation';
import DeckPageContent from '@/app/decks/[flashcardDeckId]/DeckPageContent';
import { loadOwnedDeckWithCards } from '@/lib/server/deck-data';
import { requireAuthenticatedPageUser } from '@/lib/supabase/page-auth';

export default async function DeckPage({
  params,
}: {
  params: Promise<{ flashcardDeckId: string }>;
}) {
  const { flashcardDeckId } = await params;
  const { supabase, user } = await requireAuthenticatedPageUser();
  const { deck, cards, error } = await loadOwnedDeckWithCards(supabase, user.id, flashcardDeckId);

  if (!deck) {
    notFound();
  }

  if (error) {
    throw new Error(`Failed to load cards: ${error}`);
  }

  return <DeckPageContent deck={deck} cards={cards} userEmail={user.email} />;
}

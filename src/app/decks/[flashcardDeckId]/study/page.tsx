
import { loadOwnedDeckWithCards } from '@/lib/server/deck-data';
import { requireAuthenticatedPageUser } from '@/lib/supabase/page-auth';
import { getNativeLanguage } from '@/lib/supabase/profile';
import DeckStudySession from '@/components/study/DeckStudySession';
import { DeckNotFound } from '@/components/study/StudyFeedback';

export default async function DeckStudyPage({
  params,
}: {
  params: Promise<{ flashcardDeckId: string }>;
}) {
  const { flashcardDeckId } = await params;

  const { supabase, user } = await requireAuthenticatedPageUser();
  const [{ cards, deck }, nativeLanguage] = await Promise.all([
    loadOwnedDeckWithCards(supabase, user.id, flashcardDeckId),
    getNativeLanguage(supabase, user.id),
  ]);

  if (!deck) {
    return <DeckNotFound />;
  }

  return (
    <DeckStudySession
      cards={cards}
      deck={deck}
      deckId={flashcardDeckId}
      nativeLanguage={nativeLanguage}
    />
  );
}

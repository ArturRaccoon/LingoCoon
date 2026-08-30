
import { loadScheduledStudyPageData } from '@/lib/study-page';
import StudySession from '@/components/study/StudySession';
import { DeckNotFound, NoCardsDue } from '@/components/study/StudyFeedback';

export default async function StudyPage({
  params,
  searchParams,
}: {
  params: Promise<{ deckId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { deckId } = await params;
  const { mode } = await searchParams;

  const { cardResult, deck, nativeLanguage } = await loadScheduledStudyPageData(
    deckId,
    mode === 'all',
  );

  if (cardResult.error || !deck) {
    return <DeckNotFound error={cardResult.error ?? undefined} />;
  }

  if (cardResult.cards.length === 0) {
    return <NoCardsDue deckId={deck.id} mode="classic" />;
  }

  return (
    <StudySession
      cards={cardResult.cards}
      deck={deck}
      nativeLanguage={nativeLanguage}
    />
  );
}

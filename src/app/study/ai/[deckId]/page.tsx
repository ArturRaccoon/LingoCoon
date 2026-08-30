
import { loadScheduledStudyPageData } from '@/lib/study-page';
import AiStudySession from '@/components/study/AiStudySession';
import { DeckNotFound, NoCardsDue } from '@/components/study/StudyFeedback';

export default async function AiStudyPage({
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
    return <NoCardsDue deckId={deck.id} mode="ai" />;
  }

  return (
    <AiStudySession
      cards={cardResult.cards}
      deck={deck}
      nativeLanguage={nativeLanguage}
    />
  );
}

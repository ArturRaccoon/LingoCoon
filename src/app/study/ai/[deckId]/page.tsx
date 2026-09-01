
import { loadScheduledStudyPageData } from '@/lib/study-page';
import { MAX_AI_STUDY_CARDS } from '@/lib/tutor-security';
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

  const { cardResult, deck } = await loadScheduledStudyPageData(
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
      cards={cardResult.cards.slice(0, MAX_AI_STUDY_CARDS)}
      deck={deck}
    />
  );
}

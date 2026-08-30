import { loadOwnedDeck, loadStudyCards } from '@/lib/server/deck-data';
import { requireAuthenticatedPageUser } from '@/lib/supabase/page-auth';
import { getNativeLanguage } from '@/lib/supabase/profile';

export async function loadScheduledStudyPageData(deckId: string, studyAll: boolean) {
  const { supabase, user } = await requireAuthenticatedPageUser();

  const [cardResult, { deck }, nativeLanguage] = await Promise.all([
    loadStudyCards(supabase, deckId, studyAll ? 'all' : 'due'),
    loadOwnedDeck(supabase, user.id, deckId),
    getNativeLanguage(supabase, user.id),
  ]);

  return { cardResult, deck, nativeLanguage };
}

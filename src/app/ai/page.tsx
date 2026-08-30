
import { getDecks } from '@/lib/actions/deck-actions';
import { requireAuthenticatedPageUser } from '@/lib/supabase/page-auth';
import { getLanguageProfile } from '@/lib/supabase/profile';
import AiPageClient from '@/components/ai/AiPageClient';

export default async function AiPage() {
  const { supabase, user } = await requireAuthenticatedPageUser();
  const [{ decks }, { nativeLanguage, targetLanguage }] = await Promise.all([
    getDecks(),
    getLanguageProfile(supabase, user.id),
  ]);

  return (
    <AiPageClient
      decks={decks}
      userEmail={user.email}
      nativeLanguage={nativeLanguage}
      targetLanguage={targetLanguage}
    />
  );
}

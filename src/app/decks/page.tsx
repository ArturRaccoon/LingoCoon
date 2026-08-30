import AppShell from '@/components/layout/AppShell';
import { getDecks } from '@/lib/actions/deck-actions';
import { requireAuthenticatedPageUser } from '@/lib/supabase/page-auth';
import DecksContent from './DecksContent';

export default async function DecksPage() {
  const { user } = await requireAuthenticatedPageUser();
  const { decks } = await getDecks();

  return (
    <AppShell userEmail={user.email}>
      <DecksContent initialDecks={decks} />
    </AppShell>
  );
}

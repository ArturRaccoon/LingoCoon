import AppShell from '@/components/layout/AppShell';
import { LexicoonPage } from '@/components/lexicoon/LexicoonPage';
import { requireAuthenticatedPageUser } from '@/lib/supabase/page-auth';
import { getLanguageProfile } from '@/lib/supabase/profile';

export default async function LexicoonRoute() {
  const { supabase, user } = await requireAuthenticatedPageUser();
  const { targetLanguage } = await getLanguageProfile(supabase, user.id);

  return (
    <AppShell userEmail={user.email}>
      <LexicoonPage
        targetLanguage={targetLanguage ?? 'en'}
      />
    </AppShell>
  );
}

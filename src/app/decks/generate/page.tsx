
import AppShell from '@/components/layout/AppShell';
import AiDeckGenerator from '@/components/ai/AiDeckGenerator';
import { requireAuthenticatedPageUser } from '@/lib/supabase/page-auth';
import { getProfile } from '@/lib/supabase/profile';

export default async function GenerateDeckPage() {
  const { supabase, user } = await requireAuthenticatedPageUser();
  const profile = await getProfile(supabase, user.id);

  return (
    <AppShell userEmail={user.email}>
      <AiDeckGenerator
        currentLevel={profile?.current_level ?? null}
        learningPurpose={profile?.learning_purpose ?? null}
        learningPurposeDetails={profile?.learning_purpose_details ?? null}
        nativeLanguage={profile?.native_language ?? null}
        targetLanguage={profile?.target_language ?? null}
      />
    </AppShell>
  );
}

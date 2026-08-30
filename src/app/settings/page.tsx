import AppShell from '@/components/layout/AppShell';
import { requireAuthenticatedPageUser } from '@/lib/supabase/page-auth';
import { getProfile } from '@/lib/supabase/profile';
import SettingsContent from './SettingsContent';

export default async function SettingsPage() {
  const { supabase, user } = await requireAuthenticatedPageUser();
  const profile = await getProfile(supabase, user.id);

  return (
    <AppShell userEmail={user.email}>
      <SettingsContent profile={profile} />
    </AppShell>
  );
}

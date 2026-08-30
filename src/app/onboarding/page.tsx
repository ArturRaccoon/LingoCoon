'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useProfile } from '@/hooks/useProfile';

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile, loading, error, reloadProfile, completeOnboarding } = useProfile();

  useEffect(() => {
    if (!loading && profile?.onboarding_completed) {
      router.replace('/dashboard');
    }
  }, [loading, profile, router]);

  if (loading) {
    return <LoadingProfile />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="space-y-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => void reloadProfile()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            {t('common.retry', { defaultValue: 'Retry' })}
          </button>
        </div>
      </div>
    );
  }

  if (profile?.onboarding_completed) {
    return null;
  }

  return <OnboardingFlow onCompleteOnboarding={completeOnboarding} />;
}

function LoadingProfile() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    </div>
  );
}

'use client';

import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface StepNavigationProps {
  onBack: () => void;
  onNext: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  isLoading?: boolean;
}

export function StepNavigation({
  onBack,
  onNext,
  canGoNext,
  canGoBack,
  isLoading = false,
}: StepNavigationProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-4 pt-6">
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={!canGoBack || isLoading}
        className="gap-2"
        aria-label={t('common.back')}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{t('common.back')}</span>
      </Button>
      <Button
        onClick={onNext}
        disabled={!canGoNext || isLoading}
        className="min-w-[140px] gap-2"
        aria-label={t('common.next')}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('onboarding.saving')}
          </>
        ) : (
          <>
            {t('common.next')}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

'use client';

import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}
const STEP_LABEL_KEYS = [
  'welcome',
  'native_label',
  'target_label',
  'level_label',
  'purpose_label',
  'nickname_label',
  'summary_label'
];

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const { t } = useTranslation();
  const progressPercentage = (currentStep / (totalSteps - 1)) * 100;
  const key = STEP_LABEL_KEYS[currentStep] || 'steps';

  return (
    <div className="w-full space-y-2" role="region" aria-label={t('onboarding.progress_region')}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          {t(`onboarding.step_labels.${key}`)}
        </span>
        <span className="text-muted-foreground" aria-live="polite">
          {t('onboarding.step_indicator', { current: currentStep + 1, total: totalSteps })}
        </span>
      </div>
      <Progress
        value={progressPercentage}
        className="h-2"
        aria-label={t('onboarding.progress_aria', { current: currentStep + 1, total: totalSteps })}
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      />
    </div>
  );
}

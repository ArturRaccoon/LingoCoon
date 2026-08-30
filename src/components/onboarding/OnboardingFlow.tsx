'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import LanguageSelector from '@/components/LanguageSelector';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { StepNavigation } from '@/components/onboarding/StepNavigation';
import { LanguageStep } from '@/components/onboarding/steps/LanguageStep';
import { LevelStep } from '@/components/onboarding/steps/LevelStep';
import { NicknameStep } from '@/components/onboarding/steps/NicknameStep';
import { PurposeStep } from '@/components/onboarding/steps/PurposeStep';
import { SummaryStep } from '@/components/onboarding/steps/SummaryStep';
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep';
import {
  INITIAL_ONBOARDING_FORM_DATA,
  TOTAL_ONBOARDING_STEPS,
  isValidOnboardingData,
  normalizeOnboardingFormData,
} from '@/lib/onboarding';
import type { OnboardingFormData } from '@/lib/onboarding';
import {
  clearPendingOnboarding,
  loadPendingOnboarding,
  savePendingOnboarding,
} from '@/lib/onboarding-storage';
import { createClient } from '@/lib/supabase/client';
import type { OnboardingData } from '@/lib/supabase/types';

const SUMMARY_STEP_INDEX = TOTAL_ONBOARDING_STEPS - 1;

interface OnboardingFlowProps {
  onCompleteOnboarding: (data: OnboardingData) => Promise<void>;
}

export function OnboardingFlow({ onCompleteOnboarding }: OnboardingFlowProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [pendingOnboarding] = useState(loadPendingOnboarding);
  const [currentStep, setCurrentStep] = useState(
    pendingOnboarding ? SUMMARY_STEP_INDEX : 0,
  );
  const [formData, setFormData] = useState<OnboardingFormData>(
    normalizeOnboardingFormData(pendingOnboarding ?? INITIAL_ONBOARDING_FORM_DATA),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentStepIsValid = isOnboardingStepValid(currentStep, formData);

  const updateField = useCallback(
    <K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => {
      setFormData((previous) => ({ ...previous, [field]: value }));
    },
    [],
  );

  const updateNativeLanguage = useCallback((language: string) => {
    setFormData((previous) => ({
      ...previous,
      native_language: language,
      target_language: previous.target_language === language ? '' : previous.target_language,
    }));
  }, []);

  const goToNextStep = () => {
    if (currentStepIsValid && currentStep < SUMMARY_STEP_INDEX) {
      setCurrentStep((step) => step + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < TOTAL_ONBOARDING_STEPS) {
      setCurrentStep(step);
    }
  };

  const handleComplete = async () => {
    const onboardingData = buildOnboardingData(formData);
    if (!isValidOnboardingData(onboardingData)) {
      toast.error(t('onboarding.errors.invalid_data'));
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        savePendingOnboarding(onboardingData);
        router.push('/login?message=onboarding_complete');
        return;
      }

      await onCompleteOnboarding(onboardingData);
      clearPendingOnboarding();
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast.error(t('onboarding.errors.generic_save'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNavigation = currentStep > 0 && currentStep < SUMMARY_STEP_INDEX;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative z-50 flex justify-end border-b border-gray-200 p-4 sm:p-6">
        <LanguageSelector />
      </header>

      {isSubmitting && <SubmittingOverlay />}

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        {currentStep > 0 && (
          <div className="mb-8">
            <ProgressBar currentStep={currentStep} totalSteps={TOTAL_ONBOARDING_STEPS} />
          </div>
        )}
        <div className="flex flex-1 flex-col justify-center">
          <div
            key={currentStep}
            className="animate-in fade-in-0 slide-in-from-right-4 duration-300"
          >
            {renderStep()}
          </div>
        </div>
        {showNavigation && (
          <StepNavigation
            onBack={goToPreviousStep}
            onNext={goToNextStep}
            canGoBack
            canGoNext={currentStepIsValid}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );

  function renderStep() {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={goToNextStep} />;
      case 1:
        return (
          <LanguageStep
            title={t('onboarding.step1.native_language')}
            subtitle={t('onboarding.step1.native_subtitle')}
            type="native"
            value={formData.native_language}
            onChange={updateNativeLanguage}
          />
        );
      case 2:
        return (
          <LanguageStep
            title={t('onboarding.step1.target_language')}
            subtitle={t('onboarding.step1.target_subtitle')}
            type="target"
            value={formData.target_language}
            onChange={(language) => updateField('target_language', language)}
            excludeLanguage={formData.native_language}
          />
        );
      case 3:
        return (
          <LevelStep
            value={formData.current_level}
            onChange={(level) => updateField('current_level', level)}
          />
        );
      case 4:
        return (
          <PurposeStep
            value={formData.learning_purpose}
            details={formData.learning_purpose_details}
            onChange={(purpose) => updateField('learning_purpose', purpose)}
            onDetailsChange={(details) => updateField('learning_purpose_details', details)}
          />
        );
      case 5:
        return (
          <NicknameStep
            value={formData.nickname}
            onChange={(nickname) => updateField('nickname', nickname)}
            onSkip={goToNextStep}
          />
        );
      case SUMMARY_STEP_INDEX:
        return (
          <SummaryStep
            data={formData}
            onEdit={goToStep}
            onComplete={handleComplete}
            isLoading={isSubmitting}
          />
        );
      default:
        return null;
    }
  }
}

function buildOnboardingData(formData: OnboardingFormData): OnboardingData {
  const purposeDetails = formData.learning_purpose_details?.trim();

  return {
    nickname: formData.nickname.trim() || 'Learner',
    native_language: formData.native_language,
    target_language: formData.target_language,
    current_level: formData.current_level,
    learning_purpose: formData.learning_purpose,
    learning_purpose_details: purposeDetails || undefined,
  };
}

function isOnboardingStepValid(step: number, formData: OnboardingFormData) {
  switch (step) {
    case 0:
    case 5:
      return true;
    case 1:
      return Boolean(formData.native_language);
    case 2:
      return Boolean(formData.target_language);
    case 3:
      return Boolean(formData.current_level);
    case 4:
      return Boolean(formData.learning_purpose);
    case SUMMARY_STEP_INDEX:
      return isValidOnboardingData(buildOnboardingData(formData));
    default:
      return false;
  }
}

function SubmittingOverlay() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">{t('onboarding.creating_account')}</p>
      </div>
    </div>
  );
}

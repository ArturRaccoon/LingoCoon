import { isAppLanguageCode } from '@/lib/languages';
import type { OnboardingData } from '@/lib/supabase/types';

export const ONBOARDING_LEVELS = [
  'absolute_beginner',
  'beginner',
  'intermediate',
  'advanced',
] as const;

export const ONBOARDING_PURPOSES = ['work', 'study', 'travel', 'hobby'] as const;

export const TOTAL_ONBOARDING_STEPS = 7;

export interface OnboardingFormData {
  native_language: string;
  target_language: string;
  current_level: string;
  learning_purpose: string;
  learning_purpose_details: string;
  nickname: string;
}

export const INITIAL_ONBOARDING_FORM_DATA: OnboardingFormData = {
  native_language: '',
  target_language: '',
  current_level: '',
  learning_purpose: '',
  learning_purpose_details: '',
  nickname: '',
};

export function normalizeOnboardingFormData(
  value: Partial<OnboardingFormData> | null | undefined,
): OnboardingFormData {
  return {
    ...INITIAL_ONBOARDING_FORM_DATA,
    ...value,
    learning_purpose_details: value?.learning_purpose_details ?? '',
    nickname: value?.nickname ?? '',
  };
}

function isAllowedValue<T extends string>(
  allowedValues: readonly T[],
  value: unknown,
): value is T {
  return typeof value === 'string' && allowedValues.includes(value as T);
}

export function isValidOnboardingData(value: unknown): value is OnboardingData {
  if (!value || typeof value !== 'object') return false;

  const data = value as Record<string, unknown>;

  return (
    typeof data.nickname === 'string' &&
    data.nickname.trim().length > 0 &&
    data.nickname.length <= 30 &&
    isAppLanguageCode(data.native_language) &&
    isAppLanguageCode(data.target_language) &&
    data.native_language !== data.target_language &&
    isAllowedValue(ONBOARDING_LEVELS, data.current_level) &&
    isAllowedValue(ONBOARDING_PURPOSES, data.learning_purpose) &&
    (data.learning_purpose_details === undefined ||
      (typeof data.learning_purpose_details === 'string' &&
        data.learning_purpose_details.length <= 500))
  );
}

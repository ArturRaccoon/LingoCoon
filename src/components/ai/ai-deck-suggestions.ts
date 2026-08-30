import type { TFunction } from 'i18next';
import { ONBOARDING_LEVELS, ONBOARDING_PURPOSES } from '@/lib/onboarding';
import { getTranslatedLanguageName } from '@/lib/translated-language';

interface StudentPromptProfile {
  currentLevel: string | null;
  learningPurpose: string | null;
  learningPurposeDetails: string | null;
  nativeLanguage: string | null;
  targetLanguage: string | null;
}

interface StudentPromptValues {
  [key: string]: string;
  level: string;
  native: string;
  purpose: string;
  target: string;
}

export function buildAiDeckSuggestions(
  t: TFunction,
  profile: StudentPromptProfile,
): string[] {
  const values = getStudentPromptValues(t, profile);
  const suggestions = [
    t('ai_deck.suggestions.purpose', values),
    t('ai_deck.suggestions.conversation', values),
    t('ai_deck.suggestions.verbs', values),
    t('ai_deck.suggestions.food', values),
  ];

  if (profile.learningPurposeDetails?.trim()) {
    suggestions.unshift(t('ai_deck.suggestions.personal_goal', {
      ...values,
      details: profile.learningPurposeDetails.trim(),
    }));
  }

  return suggestions;
}

export function getStudentPromptValues(
  t: TFunction,
  profile: StudentPromptProfile,
): StudentPromptValues {
  return {
    level: profile.currentLevel
      ? getLocalizedProfileValue(
          t,
          ONBOARDING_LEVELS,
          profile.currentLevel,
          'onboarding.step3.levels',
          'ai_deck.fallback_level',
        ).toLocaleLowerCase()
      : t('ai_deck.fallback_level'),
    native: profile.nativeLanguage
      ? getTranslatedLanguageName(t, profile.nativeLanguage)
      : t('ai_deck.fallback_native_language'),
    purpose: profile.learningPurpose
      ? getLocalizedProfileValue(
          t,
          ONBOARDING_PURPOSES,
          profile.learningPurpose,
          'onboarding.step2.goals',
          'ai_deck.fallback_purpose',
        ).toLocaleLowerCase()
      : t('ai_deck.fallback_purpose'),
    target: profile.targetLanguage
      ? getTranslatedLanguageName(t, profile.targetLanguage)
      : t('ai_deck.fallback_target_language'),
  };
}

function getLocalizedProfileValue(
  t: TFunction,
  allowedValues: readonly string[],
  value: string,
  translationPrefix: string,
  fallbackKey: string,
): string {
  return allowedValues.includes(value) ? t(`${translationPrefix}.${value}`) : t(fallbackKey);
}

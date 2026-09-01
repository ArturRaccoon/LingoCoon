import type { OnboardingData } from '@/lib/supabase/types';
import {
  createExpiringStorageEnvelope,
  readExpiringStorageEnvelope,
} from '@/lib/expiring-storage';
import { isValidOnboardingData } from '@/lib/onboarding';

const PENDING_ONBOARDING_STORAGE_KEY = 'pending_onboarding';
const PENDING_ONBOARDING_TTL_MS = 24 * 60 * 60 * 1_000;

export function parsePendingOnboarding(value: unknown): OnboardingData | null {
  if (!isValidOnboardingData(value)) return null;

  return {
    nickname: value.nickname.trim(),
    native_language: value.native_language,
    target_language: value.target_language,
    current_level: value.current_level,
    learning_purpose: value.learning_purpose,
    learning_purpose_details: value.learning_purpose_details?.trim() || undefined,
  };
}

export function loadPendingOnboarding(): OnboardingData | null {
  if (typeof window === 'undefined') return null;

  const storedValue = window.localStorage.getItem(PENDING_ONBOARDING_STORAGE_KEY);
  if (!storedValue) return null;

  try {
    const value = readExpiringStorageEnvelope(JSON.parse(storedValue));
    const onboarding = parsePendingOnboarding(value);

    if (!onboarding) clearPendingOnboarding();
    return onboarding;
  } catch {
    clearPendingOnboarding();
    return null;
  }
}

export function savePendingOnboarding(data: OnboardingData) {
  if (typeof window === 'undefined') return;
  if (!isValidOnboardingData(data)) {
    throw new Error('Cannot save invalid onboarding data.');
  }

  const envelope = createExpiringStorageEnvelope(data, PENDING_ONBOARDING_TTL_MS);
  window.localStorage.setItem(PENDING_ONBOARDING_STORAGE_KEY, JSON.stringify(envelope));
}

export function clearPendingOnboarding() {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(PENDING_ONBOARDING_STORAGE_KEY);
}

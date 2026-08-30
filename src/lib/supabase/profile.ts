
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Profile } from './types';

/**
 * Read the user's profile. A missing profile is allowed during account setup.
 */
export async function getProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return data;
}

/**
 * Read the native and target languages used by AI and study pages.
 */
export async function getLanguageProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ nativeLanguage: string | null; targetLanguage: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('native_language, target_language')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load language profile: ${error.message}`);
  }

  return {
    nativeLanguage: data?.native_language ?? null,
    targetLanguage: data?.target_language ?? null,
  };
}

/**
 * Read the native language, using English until the user finishes onboarding.
 */
export async function getNativeLanguage(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string> {
  const { nativeLanguage } = await getLanguageProfile(supabase, userId);

  return nativeLanguage ?? 'en';
}

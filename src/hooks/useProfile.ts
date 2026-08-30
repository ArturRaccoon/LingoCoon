'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isValidOnboardingData } from '@/lib/onboarding';
import type { Database, OnboardingData } from '@/lib/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

async function fetchCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError?.name === 'AuthSessionMissingError') return null;
  if (userError) throw userError;
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setProfile(await fetchCurrentProfile());
    } catch (loadError) {
      console.error('[useProfile] Failed to load profile:', loadError);
      setError('Could not load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignoreResult = false;

    void fetchCurrentProfile()
      .then((loadedProfile) => {
        if (ignoreResult) return;

        setProfile(loadedProfile);
        setLoading(false);
      })
      .catch((loadError) => {
        if (ignoreResult) return;

        console.error('[useProfile] Failed to load profile:', loadError);
        setError('Could not load your profile. Please try again.');
        setLoading(false);
      });

    return () => {
      ignoreResult = true;
    };
  }, []);

  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    if (!isValidOnboardingData(data)) {
      throw new Error('Invalid onboarding data.');
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Authentication is required to save the profile.');
    }

    const now = new Date().toISOString();
    const updates: ProfileUpdate = {
      nickname: data.nickname,
      native_language: data.native_language,
      target_language: data.target_language,
      current_level: data.current_level,
      learning_purpose: data.learning_purpose,
      learning_purpose_details: data.learning_purpose_details || null,
      onboarding_completed: true,
      onboarding_completed_at: now,
      updated_at: now,
    };

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!updated) {
      throw new Error('The profile update returned no data.');
    }

    setProfile(updated);
  }, []);

  return { profile, loading, error, reloadProfile: loadProfile, completeOnboarding };
}

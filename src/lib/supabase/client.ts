import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/lib/supabase/config';
import type { Database } from '@/lib/supabase/types';

let browserClient: SupabaseClient<Database> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  const { url, anonKey } = getSupabaseConfig();
  browserClient = createBrowserClient<Database>(url, anonKey);

  return browserClient;
}

export type { Database, OnboardingData, Profile } from '@/lib/supabase/types';

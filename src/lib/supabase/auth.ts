import { createClient } from '@/lib/supabase/server';

export class AuthenticationRequiredError extends Error {
  constructor() {
    super('Authentication required.');
    this.name = 'AuthenticationRequiredError';
  }
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  return { supabase, user: error ? null : user };
}

export async function requireAuthenticatedUser() {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    throw new AuthenticationRequiredError();
  }

  return { supabase, user };
}

export async function requireAuthenticatedClaims() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub) {
    throw new AuthenticationRequiredError();
  }

  return { claims, supabase };
}

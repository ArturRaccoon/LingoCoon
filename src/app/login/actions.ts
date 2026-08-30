'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSiteUrl } from '@/lib/server/site-url';
import { createClient } from '@/lib/supabase/server';

function getCredentials(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    return null;
  }

  return { email: email.trim(), password };
}

export async function login(formData: FormData) {
  const credentials = getCredentials(formData);
  if (!credentials) redirect('/login?error=Email and password are required');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/', 'layout');
  redirect('/onboarding');
}

export async function signup(formData: FormData) {
  const credentials = getCredentials(formData);
  if (!credentials) redirect('/login?error=Email and password are required');

  const siteUrl = getSiteUrl();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/', 'layout');
  redirect('/login?message=Check your email to confirm your account');
}

export async function loginWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/onboarding`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error || !data.url) redirect('/login?error=Could not start Google login');

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

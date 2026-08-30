import { redirect } from 'next/navigation';
import {
  AuthenticationRequiredError,
  requireAuthenticatedUser,
} from '@/lib/supabase/auth';

export async function requireAuthenticatedPageUser() {
  try {
    return await requireAuthenticatedUser();
  } catch (error) {
    if (!(error instanceof AuthenticationRequiredError)) {
      throw error;
    }

    redirect('/login');
  }
}

/**
 * Converts raw AI errors into user-friendly messages.
 *
 * The error might come from the Gemini API, from validation, or from auth.
 * This function maps each case to a simple message the user can understand.
 */

import { InvalidAiRequestError } from '@/lib/server/ai-validation';
import { AuthenticationRequiredError } from '@/lib/supabase/auth';

export function getHumanReadableAiError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  // Auth and validation errors already have clear messages — pass them through.
  if (
    error instanceof AuthenticationRequiredError ||
    error instanceof InvalidAiRequestError
  ) {
    return message;
  }

  // Missing API key.
  if (message.includes('GEMINI_API_KEY')) {
    return 'AI service is not configured. Add a valid GEMINI_API_KEY environment variable and restart the app.';
  }

  // Invalid or revoked API key.
  if (
    message.includes('403') ||
    message.toLowerCase().includes('authorization') ||
    message.includes('API_KEY_INVALID')
  ) {
    return 'AI service authorization failed. Verify your GEMINI_API_KEY and restart the app.';
  }

  // Everything else — generic fallback.
  return 'AI service is temporarily unavailable. Please try again.';
}

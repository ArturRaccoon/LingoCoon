import { InvalidAiRequestError } from '@/lib/server/ai-validation';
import {
  buildSafeTutorHistory,
  safeParseTutorConversationRequest,
  TUTOR_SECURITY_INSTRUCTIONS,
} from '@/lib/tutor-security';
import type { TutorConversationRequest } from '@/types/ai';

export function parseTutorConversationRequest(value: unknown): TutorConversationRequest {
  const result = safeParseTutorConversationRequest(value);
  if (!result.success) {
    throw new InvalidAiRequestError(
      result.error.issues[0]?.message ?? 'Invalid AI tutor request.',
    );
  }

  return result.data;
}

export { buildSafeTutorHistory, TUTOR_SECURITY_INSTRUCTIONS };

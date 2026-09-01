'use server';

/**
 * Server Actions that call the Gemini AI.
 *
 * These are the public entry points used by React components to interact with AI.
 * Each function handles authentication, calls Gemini, and returns a clean result.
 */

import {
  sendChatMessageToGemini,
  sendStructuredRequestToGemini,
  getHumanReadableAiError,
} from '@/lib/server/ai-client';
import {
  buildPersonalizedDeckPrompt,
  type AiDeckStudentContext,
} from '@/lib/server/ai-deck-prompt';
import {
  DECK_GENERATION_SYSTEM_PROMPT,
  getDeckGenerationAiOptions,
  InvalidGeneratedDeckError,
  parseGeneratedDeck,
} from '@/lib/server/ai-deck-generation';
import { resolveTutorContext } from '@/lib/server/tutor-context';
import {
  buildSafeTutorHistory,
  parseTutorConversationRequest,
  TUTOR_SECURITY_INSTRUCTIONS,
} from '@/lib/server/tutor-request';
import { requireAuthenticatedClaims } from '@/lib/supabase/auth';
import { getProfile } from '@/lib/supabase/profile';
import type { GeneratedDeck } from '@/types/ai-deck';
import type { ConversationTurn, TutorConversationRequest } from '@/types/ai';

export type { ConversationTurn } from '@/types/ai';

export type AiDeckGenerationErrorKey =
  | 'invalid_prompt'
  | 'unexpected_format'
  | 'service_unavailable';

/**
 * Resolve a typed tutor operation into server-owned instructions and untrusted user messages.
 */
export async function sendTutorConversation(
  value: TutorConversationRequest,
): Promise<string> {
  try {
    const request = parseTutorConversationRequest(value);
    const { claims, supabase } = await requireAuthenticatedClaims();
    const tutorContext = await resolveTutorContext(request, supabase, claims.sub);
    const systemPrompt = `${tutorContext.systemPrompt}\n\n${TUTOR_SECURITY_INSTRUCTIONS}`;
    const history = buildSafeTutorHistory(tutorContext.context, request.history);

    return await sendChatMessageToGemini(systemPrompt, history, {
      userId: claims.sub,
    });
  } catch (error) {
    const message = getHumanReadableAiError(error);
    console.error('[sendTutorConversation]', message, error);
    throw new Error(message);
  }
}

/**
 * Ask the AI to generate a complete flashcard deck from a user prompt.
 * Returns either the generated deck or an error key for the UI to display.
 */
export async function generateFlashcardDeckWithAi(
  userPrompt: string,
): Promise<{ deck?: GeneratedDeck; errorKey?: AiDeckGenerationErrorKey }> {
  if (typeof userPrompt !== 'string') return { errorKey: 'invalid_prompt' };

  const trimmedPrompt = userPrompt.trim();
  if (!trimmedPrompt || trimmedPrompt.length > 1000) {
    return { errorKey: 'invalid_prompt' };
  }

  try {
    const { claims, supabase } = await requireAuthenticatedClaims();
    const profile = await getProfile(supabase, claims.sub);

    const studentContext: AiDeckStudentContext = {
      currentLevel: profile?.current_level ?? null,
      learningPurpose: profile?.learning_purpose ?? null,
      learningPurposeDetails: profile?.learning_purpose_details ?? null,
      nativeLanguage: profile?.native_language ?? null,
      targetLanguage: profile?.target_language ?? null,
    };

    const deckRequestHistory: ConversationTurn[] = [
      {
        role: 'user',
        parts: [
          {
            text: buildPersonalizedDeckPrompt(trimmedPrompt, studentContext),
          },
        ],
      },
    ];

    const aiResponse = await sendStructuredRequestToGemini(
      DECK_GENERATION_SYSTEM_PROMPT,
      deckRequestHistory,
      getDeckGenerationAiOptions(claims.sub),
    );

    return { deck: parseGeneratedDeck(aiResponse) };
  } catch (error) {
    const message =
      error instanceof InvalidGeneratedDeckError
        ? error.message
        : getHumanReadableAiError(error);

    console.error('[generateFlashcardDeckWithAi]', message);

    return {
      errorKey:
        error instanceof InvalidGeneratedDeckError
          ? 'unexpected_format'
          : 'service_unavailable',
    };
  }
}

/**
 * Converts the app's internal conversation format into the message format
 * expected by the Gemini OpenAI-compatible API.
 *
 * The app stores conversation turns as { role: 'user' | 'model', parts: [{ text }] }.
 * The Gemini API expects           { role: 'user' | 'assistant' | 'system', content: string }.
 */

import type { ConversationTurn } from '@/types/ai';

export interface GeminiApiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function convertConversationToGeminiFormat(
  systemPrompt: string,
  conversationHistory: ConversationTurn[],
): GeminiApiMessage[] {
  const systemMessage: GeminiApiMessage = {
    role: 'system',
    content: systemPrompt,
  };

  const historyMessages: GeminiApiMessage[] = conversationHistory.map(
    (turn) => ({
      role: turn.role === 'model' ? ('assistant' as const) : ('user' as const),
      content: turn.parts.map((part) => part.text).join('\n'),
    }),
  );

  return [systemMessage, ...historyMessages];
}

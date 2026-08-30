import type { ConversationTurn } from '@/types/ai';

const MAX_SYSTEM_PROMPT_LENGTH = 20_000;
const MAX_HISTORY_TURNS = 120;
const MAX_TURN_PART_LENGTH = 10_000;
const MAX_HISTORY_TEXT_LENGTH = 100_000;
export const MAX_OUTPUT_TOKENS = 1600;

export class InvalidAiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAiRequestError';
  }
}

export function validateMaxTokens(maxTokens: number): number {
  if (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > MAX_OUTPUT_TOKENS) {
    throw new InvalidAiRequestError('Invalid AI output limit.');
  }

  return maxTokens;
}

export function validateConversation(systemPrompt: string, history: ConversationTurn[]) {
  if (
    typeof systemPrompt !== 'string' ||
    !systemPrompt.trim() ||
    systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH
  ) {
    throw new InvalidAiRequestError('Invalid AI system prompt.');
  }

  if (!Array.isArray(history) || history.length === 0 || history.length > MAX_HISTORY_TURNS) {
    throw new InvalidAiRequestError('Invalid AI conversation history.');
  }

  let textLength = 0;

  for (const turn of history) {
    if (
      !turn ||
      (turn.role !== 'user' && turn.role !== 'model') ||
      !Array.isArray(turn.parts) ||
      turn.parts.length === 0
    ) {
      throw new InvalidAiRequestError('Invalid AI conversation history.');
    }

    for (const part of turn.parts) {
      if (!part || typeof part.text !== 'string' || part.text.length > MAX_TURN_PART_LENGTH) {
        throw new InvalidAiRequestError('Invalid AI conversation history.');
      }

      textLength += part.text.length;
    }
  }

  if (textLength > MAX_HISTORY_TEXT_LENGTH) {
    throw new InvalidAiRequestError('AI conversation is too long. Start a new conversation.');
  }
}

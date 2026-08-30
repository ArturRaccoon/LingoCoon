export const MAX_CHAT_INPUT_LENGTH = 500;

export function getChatInputLengthError(text: string): string | null {
  if (text.length <= MAX_CHAT_INPUT_LENGTH) return null;

  return `Message too long (max ${MAX_CHAT_INPUT_LENGTH} characters). Please shorten your answer.`;
}

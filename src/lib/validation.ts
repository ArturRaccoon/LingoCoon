export type ValidationResult =
  | { isValid: true; value: string }
  | { isValid: false; error: string };

export function validateFlashcardText(text: unknown): ValidationResult {
  if (typeof text !== 'string') {
    return { isValid: false, error: 'Text must be a string' };
  }

  const value = text.trim();
  if (!value) {
    return { isValid: false, error: 'Text cannot be empty' };
  }

  if (value.length > 500) {
    return { isValid: false, error: 'Text too long (max 500 characters)' };
  }

  return { isValid: true, value };
}

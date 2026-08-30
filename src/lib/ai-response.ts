export type AiStudyRating = 'again' | 'hard' | 'good' | 'easy';

export interface AiStudyReply {
  message: string;
  cardAdvance: boolean;
  sessionComplete: boolean;
  rating: AiStudyRating | null;
}

export function stripMarkdownCodeFence(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

export function parseAiStudyReply(text: string): AiStudyReply | null {
  try {
    const value = JSON.parse(stripMarkdownCodeFence(text)) as unknown;
    if (!value || typeof value !== 'object') return null;

    const reply = value as Record<string, unknown>;
    if (
      typeof reply.message !== 'string' ||
      typeof reply.cardAdvance !== 'boolean' ||
      typeof reply.sessionComplete !== 'boolean'
    ) {
      return null;
    }

    const rating = reply.rating ?? null;
    if (
      rating !== null &&
      rating !== 'again' &&
      rating !== 'hard' &&
      rating !== 'good' &&
      rating !== 'easy'
    ) {
      return null;
    }
    if ((reply.cardAdvance || reply.sessionComplete) && rating === null) {
      return null;
    }

    return {
      message: reply.message,
      cardAdvance: reply.cardAdvance,
      sessionComplete: reply.sessionComplete,
      rating,
    };
  } catch {
    return null;
  }
}

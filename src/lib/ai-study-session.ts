import { Rating } from 'ts-fsrs';
import type { AiStudyRating, AiStudyReply } from '@/lib/ai-response';
import type { ConversationTurn } from '@/types/ai';

export interface PendingStudyTransition {
  nextCardIndex: number | null;
  sessionComplete: boolean;
}

export function createConversationTurn(
  role: ConversationTurn['role'],
  text: string,
): ConversationTurn {
  return { role, parts: [{ text }] };
}

export function createFallbackAiStudyReply(message: string): AiStudyReply {
  return {
    message,
    cardAdvance: false,
    sessionComplete: false,
    rating: null,
  };
}

export function shouldSaveAiStudyRating(reply: AiStudyReply): reply is AiStudyReply & {
  rating: AiStudyRating;
} {
  return (reply.cardAdvance || reply.sessionComplete) && reply.rating !== null;
}

export function createPendingStudyTransition(
  reply: AiStudyReply,
  currentCardIndex: number,
  totalCards: number,
): PendingStudyTransition {
  return {
    nextCardIndex: reply.cardAdvance && currentCardIndex < totalCards - 1
      ? currentCardIndex + 1
      : null,
    sessionComplete: reply.sessionComplete,
  };
}

export function getAiStudyProgressPercent(currentCardIndex: number, totalCards: number): number {
  if (totalCards <= 0) return 0;

  return Math.min(100, Math.round((currentCardIndex / totalCards) * 100));
}

export function toAiStudyFsrsRating(rating: AiStudyRating): Rating {
  switch (rating) {
    case 'again':
      return Rating.Again;
    case 'hard':
      return Rating.Hard;
    case 'good':
      return Rating.Good;
    case 'easy':
      return Rating.Easy;
  }
}

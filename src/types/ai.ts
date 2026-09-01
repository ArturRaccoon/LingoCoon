export interface ConversationTurn {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface TutorConversationBase {
  history: ConversationTurn[];
}

export type TutorConversationRequest =
  | (TutorConversationBase & {
      operation: 'general_chat';
    })
  | (TutorConversationBase & {
      operation: 'classic_study';
      deckId: string;
      cardId: string;
    })
  | (TutorConversationBase & {
      operation: 'deck_study';
      deckId: string;
      cardId: string;
    })
  | (TutorConversationBase & {
      operation: 'ai_study';
      deckId: string;
      cardIds: string[];
    });

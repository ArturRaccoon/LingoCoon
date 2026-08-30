export interface ConversationTurn {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

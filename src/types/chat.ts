
/**
 * ChatMessage represents one bubble in a conversation.
 *
 * Why a shared type?
 * Previously, a "Message" interface with the exact same shape was declared
 * separately inside StudySession.tsx, AiStudySession.tsx, and GeneralChat.tsx.
 * That is a DRY (Don't Repeat Yourself) violation. Now it lives here once and
 * every component imports it from this single file.
 *
 * Fields:
 * - role: who wrote the message — 'user' (the student) or 'ai' (the AI).
 * - text: the message text content.
 */
export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

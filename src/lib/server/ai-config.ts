/**
 * Gemini AI configuration.
 *
 * The app uses exactly two Gemini model slots:
 *   1. chatModelId        — fast model for free-form conversation (study, chat)
 *   2. structuredModelId  — model for structured JSON responses (dictionary, deck generation, translation)
 *
 * Both default to gemini-3.5-flash-lite (free, fast, good JSON).
 * Override via GEMINI_CHAT_MODEL_ID / GEMINI_STRUCTURED_MODEL_ID env vars.
 */

const DEFAULT_CHAT_MODEL_ID = 'gemini-3.5-flash-lite';
const DEFAULT_STRUCTURED_MODEL_ID = 'gemini-3.5-flash-lite';

const GEMINI_API_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/openai';

export interface GeminiConnectionConfig {
  apiKey: string;
  baseUrl: string;
  chatModelId: string;
  structuredModelId: string;
}

export function getGeminiConnectionConfig(): GeminiConnectionConfig {
  return {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    baseUrl: process.env.GEMINI_BASE_URL ?? GEMINI_API_BASE_URL,
    chatModelId: process.env.GEMINI_CHAT_MODEL_ID ?? DEFAULT_CHAT_MODEL_ID,
    structuredModelId:
      process.env.GEMINI_STRUCTURED_MODEL_ID ?? DEFAULT_STRUCTURED_MODEL_ID,
  };
}

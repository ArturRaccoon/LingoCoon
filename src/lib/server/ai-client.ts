/**
 * Gemini AI client.
 *
 * Two public functions:
 *   - sendChatMessageToGemini()       → free-form text response (study sessions, chat)
 *   - sendStructuredRequestToGemini() → JSON response (dictionary, deck generation, translation)
 *
 * Both call a single internal function sendRequestToGeminiApi() to avoid duplication.
 */

import {
  getGeminiConnectionConfig,
  type GeminiConnectionConfig,
} from '@/lib/server/ai-config';
import { convertConversationToGeminiFormat } from '@/lib/server/ai-messages';
import {
  validateConversation,
  validateMaxTokens,
} from '@/lib/server/ai-validation';
import type { ConversationTurn } from '@/types/ai';

export { getHumanReadableAiError } from '@/lib/server/ai-errors';

// ── Constants ───────────────────────────────────────────────────────────────────

/** Keep only the most recent turns to avoid hitting token limits. */
const MAX_CONVERSATION_HISTORY_TURNS = 24;

/** Log a warning when a request takes longer than this. */
const SLOW_REQUEST_WARNING_THRESHOLD_MS = 3000;

/** Abort the request after this many milliseconds. */
const REQUEST_TIMEOUT_MS = 30_000;

// ── Public API ──────────────────────────────────────────────────────────────────

/**
 * Send a free-form chat message to Gemini and get a plain text reply.
 *
 * Used for: AI study sessions, general chat, deck study tutor.
 */
export async function sendChatMessageToGemini(
  systemPrompt: string,
  conversationHistory: ConversationTurn[],
  options: { maxTokens?: number; userId: string },
): Promise<string> {
  validateConversation(systemPrompt, conversationHistory);
  const maxTokens = validateMaxTokens(options.maxTokens ?? 400);

  const config = getGeminiConnectionConfig();
  assertApiKeyIsConfigured(config.apiKey);

  return sendRequestToGeminiApi({
    config,
    systemPrompt,
    conversationHistory,
    modelId: config.chatModelId,
    maxTokens,
    temperature: 0.2,
    topP: 0.7,
    userId: options.userId,
  });
}

/**
 * Send a request to Gemini that expects a JSON response.
 *
 * Used for: LexiCoon dictionary, deck generation, card translation suggestions.
 */
export async function sendStructuredRequestToGemini(
  systemPrompt: string,
  conversationHistory: ConversationTurn[],
  options: {
    jsonSchema: object;
    maxTokens: number;
    schemaName: string;
    userId: string;
  },
): Promise<string> {
  validateConversation(systemPrompt, conversationHistory);
  const maxTokens = validateMaxTokens(options.maxTokens);

  const config = getGeminiConnectionConfig();
  assertApiKeyIsConfigured(config.apiKey);

  return sendRequestToGeminiApi({
    config,
    systemPrompt,
    conversationHistory,
    modelId: config.structuredModelId,
    maxTokens,
    temperature: 0.1,
    responseFormat: { type: 'json_object' },
    userId: options.userId,
  });
}

// ── Internal ────────────────────────────────────────────────────────────────────

interface GeminiRequestOptions {
  config: GeminiConnectionConfig;
  conversationHistory: ConversationTurn[];
  maxTokens: number;
  modelId: string;
  responseFormat?: { type: string };
  systemPrompt: string;
  temperature: number;
  topP?: number;
  userId: string;
}

/**
 * Single internal function that sends a request to the Gemini API.
 * Both public functions call this — no duplicated fetch logic.
 */
async function sendRequestToGeminiApi(
  options: GeminiRequestOptions,
): Promise<string> {
  const recentHistory = options.conversationHistory.slice(
    -MAX_CONVERSATION_HISTORY_TURNS,
  );
  const requestStartTime = Date.now();
  const endpoint = `${options.config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const requestBody: Record<string, unknown> = {
    model: options.modelId,
    messages: convertConversationToGeminiFormat(
      options.systemPrompt,
      recentHistory,
    ),
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    user: options.userId,
    stream: false,
  };

  if (options.topP !== undefined) {
    requestBody.top_p = options.topP;
  }

  if (options.responseFormat) {
    requestBody.response_format = options.responseFormat;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  logSlowRequestWarning(
    options.modelId,
    recentHistory.length,
    requestStartTime,
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error(
      `[sendRequestToGeminiApi] HTTP ${response.status}:`,
      errorBody,
    );
    throw new Error(
      `Gemini API request failed (${response.status}): ${errorBody}`,
    );
  }

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const responseText = result.choices?.[0]?.message?.content;

  if (typeof responseText !== 'string' || !responseText) {
    throw new Error('Gemini returned an empty response.');
  }

  return responseText;
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function assertApiKeyIsConfigured(apiKey: string): void {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
}

function logSlowRequestWarning(
  modelId: string,
  historyTurnCount: number,
  requestStartTime: number,
): void {
  const durationMs = Date.now() - requestStartTime;
  if (durationMs < SLOW_REQUEST_WARNING_THRESHOLD_MS) return;

  console.warn('[sendRequestToGeminiApi] Slow response', {
    durationMs,
    historyTurnCount,
    modelId,
  });
}

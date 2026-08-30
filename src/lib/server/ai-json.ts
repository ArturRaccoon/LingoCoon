import { stripMarkdownCodeFence } from '@/lib/ai-response';

export function extractJsonObject(rawResponse: string): string {
  const response = stripMarkdownCodeFence(rawResponse);
  const firstBrace = response.indexOf('{');
  const lastBrace = response.lastIndexOf('}');

  return firstBrace >= 0 && lastBrace > firstBrace
    ? response.slice(firstBrace, lastBrace + 1)
    : response;
}

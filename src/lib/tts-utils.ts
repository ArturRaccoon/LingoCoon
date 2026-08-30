/**
 * Remove legacy XML-style markers before sending text to ElevenLabs.
 * ElevenLabs detects mixed languages directly from plain text.
 */
export function prepareTtsText(text: string): string {
  return text
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

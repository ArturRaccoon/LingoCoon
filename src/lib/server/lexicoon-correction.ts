import type { LexicoonEntry } from '@/types/lexicoon';

export function getLexicoonCorrection(
  sourceText: string,
  word: string,
): LexicoonEntry['correction'] {
  const from = sourceText.trim();
  const to = word.trim();
  if (!from || !to) return null;
  if (from.toLocaleLowerCase() === to.toLocaleLowerCase()) return null;

  return { from, to };
}

export function isLikelySpellingCorrection(sourceText: string, word: string): boolean {
  const from = normalizeCorrectionText(sourceText);
  const to = normalizeCorrectionText(word);
  if (!from || !to) return false;
  if (from === to) return true;

  const sourceTokens = from.split(/\s+/).filter(Boolean);
  if (sourceTokens.includes(to)) return true;

  const distance = getEditDistance(from, to);
  const maxLength = Math.max(from.length, to.length);
  if (maxLength <= 4) return distance <= 2;

  return distance / maxLength <= 0.4;
}

function normalizeCorrectionText(text: string): string {
  return text
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{Letter}\p{Number}\s]/gu, '')
    .replace(/\s+/g, ' ');
}

function getEditDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        current[rightIndex - 1] + 1,
        previous[rightIndex - 1] + cost,
      );
    }

    for (let index = 0; index < previous.length; index += 1) {
      previous[index] = current[index] ?? 0;
    }
  }

  return previous[right.length] ?? 0;
}

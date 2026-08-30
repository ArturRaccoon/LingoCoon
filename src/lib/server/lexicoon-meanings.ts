import type { LexicoonEntry } from '@/types/lexicoon';

export function filterMeaningsBySourceText(
  meanings: LexicoonEntry['meanings'],
  sourceTexts: string[],
) {
  const normalizedSourceTexts = sourceTexts
    .map((sourceText) => sourceText.trim().toLocaleLowerCase())
    .filter(Boolean);
  if (normalizedSourceTexts.length === 0) return meanings;

  return meanings.filter((meaning) =>
    meaning.examples.some((example) =>
      normalizedSourceTexts.some((sourceText) =>
        example.sentence.toLocaleLowerCase().includes(sourceText),
      ),
    ),
  );
}

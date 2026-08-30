'use client';

import { useTranslation } from 'react-i18next';
import { LexicoonAudioButton } from '@/components/lexicoon/LexicoonAudioButton';
import type { LexicoonMeaning } from '@/types/lexicoon';

interface LexicoonMeaningCardProps {
  audioLanguageCode: string;
  index: number;
  loadingAudioRequestId: string | null;
  meaning: LexicoonMeaning;
  onPlayAudio: (text: string, requestId: string, languageCode?: string) => void;
}

export function LexicoonMeaningCard({
  audioLanguageCode,
  index,
  loadingAudioRequestId,
  meaning,
  onPlayAudio,
}: LexicoonMeaningCardProps) {
  const { t } = useTranslation();

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
          {index + 1}
        </span>
        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-800">
          {meaning.partOfSpeech}
        </span>
      </div>

      <h3 className="text-xl font-bold text-gray-900">{meaning.translation}</h3>

      <div className="mt-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">
          {t('lexicoon.examples')}
        </h4>
        {meaning.examples.map((example, exampleIndex) => {
          const requestId = `meaning-${index}-example-${exampleIndex}`;

          return (
            <div key={requestId} className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-800">{example.sentence}</p>
                <p className="mt-1 text-xs text-gray-500">{example.translation}</p>
              </div>
              <LexicoonAudioButton
                compact
                isLoading={loadingAudioRequestId === requestId}
                label={t('tts.play_audio')}
                onClick={() => onPlayAudio(example.sentence, requestId, audioLanguageCode)}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
        <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
          {t('lexicoon.explanation')}
        </h4>
        <p className="text-sm leading-relaxed text-gray-600">{meaning.definition}</p>
      </div>

      {meaning.usageNote && (
        <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <span className="font-semibold">{t('lexicoon.usage_note')}:</span> {meaning.usageNote}
        </div>
      )}

      <WordList label={t('lexicoon.meaning_synonyms')} words={meaning.synonyms} />
      <WordList label={t('lexicoon.antonyms')} words={meaning.antonyms} />
    </article>
  );
}

export function PillList({ words }: { words: string[] }) {
  if (words.length === 0) {
    return <p className="text-sm text-gray-400">-</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {words.map((word) => (
        <span key={word} className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600">
          {word}
        </span>
      ))}
    </div>
  );
}

function WordList({ label, words }: { label: string; words: string[] }) {
  if (words.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">{label}</h4>
      <PillList words={words} />
    </div>
  );
}

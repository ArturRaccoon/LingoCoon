import type { TFunction } from 'i18next';
import { LexicoonAudioButton } from '@/components/lexicoon/LexicoonAudioButton';
import type { LexicoonEntry } from '@/types/lexicoon';

interface LexicoonEntryHeaderProps {
  entry: LexicoonEntry;
  isAudioLoading: boolean;
  onPlayAudio: (text: string, requestId: string, languageCode?: string) => void;
  t: TFunction;
}

export function LexicoonEntryHeader({
  entry,
  isAudioLoading,
  onPlayAudio,
  t,
}: LexicoonEntryHeaderProps) {
  const partsOfSpeech = [...new Set(entry.meanings.map((meaning) => meaning.partOfSpeech))];

  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {entry.language}
        </p>
        <h2 className="text-3xl font-bold text-gray-900">{entry.word}</h2>
        {entry.pronunciation && (
          <p className="mt-1 text-sm text-gray-500">{entry.pronunciation}</p>
        )}
        {entry.correction && (
          <p className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            {t('lexicoon.corrected_from', {
              from: entry.correction.from,
              to: entry.correction.to,
            })}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {partsOfSpeech.map((partOfSpeech) => (
            <span
              key={partOfSpeech}
              className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600"
            >
              {partOfSpeech}
            </span>
          ))}
        </div>
      </div>
      <LexicoonAudioButton
        isLoading={isAudioLoading}
        label={t('tts.play_pronunciation')}
        onClick={() => onPlayAudio(entry.word, 'entry-word', entry.languageCode)}
      />
    </div>
  );
}

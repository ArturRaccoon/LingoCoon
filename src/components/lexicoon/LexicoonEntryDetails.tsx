import type { TFunction } from 'i18next';
import { LexicoonInfoCard } from '@/components/lexicoon/LexicoonInfoCard';
import { PillList } from '@/components/lexicoon/LexicoonMeaningCard';
import type { LexicoonEntry } from '@/types/lexicoon';

interface LexicoonEntryDetailsProps {
  entry: LexicoonEntry;
  t: TFunction;
}

export function LexicoonEntryDetails({ entry, t }: LexicoonEntryDetailsProps) {
  return (
    <>
      <LexicoonInfoCard title={t('lexicoon.essence')}>
        <p className="text-lg font-medium leading-relaxed text-gray-900">
          {entry.essence}
        </p>
      </LexicoonInfoCard>

      <LexicoonInfoCard title={t('lexicoon.explanation')}>
        <p className="text-sm leading-7 text-gray-700">{entry.explanation}</p>
      </LexicoonInfoCard>

      {entry.contrast && (
        <LexicoonInfoCard title={t('lexicoon.contrast')}>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-lg font-bold text-gray-900">{entry.word}</p>
            </div>
            <p className="text-center text-sm font-semibold text-gray-400">↔</p>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-lg font-bold text-gray-900">{entry.contrast.word}</p>
              <p className="mt-1 text-xs text-gray-500">{entry.contrast.label}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-gray-700">
            {entry.contrast.explanation}
          </p>
        </LexicoonInfoCard>
      )}

      <LexicoonInfoCard title={t('lexicoon.synonyms')}>
        <PillList words={entry.synonyms} />
      </LexicoonInfoCard>

      {entry.usage && (
        <LexicoonInfoCard title={t('lexicoon.usage')}>
          <div className="grid gap-3 sm:grid-cols-2">
            <UsageBox label={t('lexicoon.written')} text={entry.usage.written} />
            <UsageBox label={t('lexicoon.spoken')} text={entry.usage.spoken} />
          </div>
        </LexicoonInfoCard>
      )}

      <LexicoonInfoCard title={t('lexicoon.collocations')}>
        <PillList words={entry.collocations} />
      </LexicoonInfoCard>

      {entry.curiosity && (
        <LexicoonInfoCard title={t('lexicoon.curiosity')}>
          <p className="text-sm leading-7 text-gray-700">{entry.curiosity}</p>
        </LexicoonInfoCard>
      )}
    </>
  );
}

function UsageBox({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
        {label}
      </h4>
      <p className="text-sm leading-6 text-gray-700">{text}</p>
    </div>
  );
}

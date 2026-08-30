'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LexicoonEmptyState } from '@/components/lexicoon/LexicoonEmptyState';
import { LexicoonEntryDetails } from '@/components/lexicoon/LexicoonEntryDetails';
import { LexicoonEntryHeader } from '@/components/lexicoon/LexicoonEntryHeader';
import { LexicoonMeaningCard } from '@/components/lexicoon/LexicoonMeaningCard';
import { LexicoonSearchForm } from '@/components/lexicoon/LexicoonSearchForm';
import { LexicoonTranslations } from '@/components/lexicoon/LexicoonTranslations';
import { useTtsAudio } from '@/hooks/useTtsAudio';
import { lookUpLexicoonEntry } from '@/lib/actions/lexicoon-actions';
import type { LexicoonEntry } from '@/types/lexicoon';

interface LexicoonPageProps {
  targetLanguage: string;
}

export function LexicoonPage({ targetLanguage }: LexicoonPageProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [entry, setEntry] = useState<LexicoonEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { loadingRequestId, playAudio, stopAudio } = useTtsAudio();

  const handleLookup = async () => {
    const word = query.trim();
    if (!word || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await lookUpLexicoonEntry(word);

      if (result.errorKey || !result.entry) {
        setEntry(null);
        setError(t(`lexicoon.errors.${result.errorKey ?? 'service_unavailable'}`));
        return;
      }

      setEntry(result.entry);
    } catch {
      setEntry(null);
      setError(t('lexicoon.errors.service_unavailable'));
    } finally {
      setIsLoading(false);
    }
  };

  const playEntryAudio = (text: string, requestId: string, languageCode = targetLanguage) => {
    void playAudio({ languageCode, speed: 0.9, text }, requestId);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <LexicoonPageHeader subtitle={t('lexicoon.subtitle')} />

      <LexicoonSearchForm
        disabled={isLoading}
        hint={t('lexicoon.search_hint')}
        isLoading={isLoading}
        label={t('lexicoon.search_label')}
        onChange={setQuery}
        onRecordingStart={stopAudio}
        onSearch={() => void handleLookup()}
        onTranscript={setQuery}
        placeholder={t('lexicoon.search_placeholder')}
        searchLabel={t('lexicoon.search_button')}
        speechLanguageCode={targetLanguage}
        value={query}
      />

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!entry && !error && !isLoading && (
        <LexicoonEmptyState />
      )}

      {entry && (
        <section className="space-y-5">
          <LexicoonEntryHeader
            entry={entry}
            isAudioLoading={loadingRequestId === 'entry-word'}
            onPlayAudio={playEntryAudio}
            t={t}
          />

          <LexicoonTranslations
            meanings={entry.meanings}
            title={t('lexicoon.translations')}
          />

          {entry.meanings.map((meaning, index) => (
            <LexicoonMeaningCard
              key={`${meaning.partOfSpeech}-${index}`}
              audioLanguageCode={entry.languageCode}
              index={index}
              loadingAudioRequestId={loadingRequestId}
              meaning={meaning}
              onPlayAudio={playEntryAudio}
            />
          ))}

          <LexicoonEntryDetails entry={entry} t={t} />
        </section>
      )}
    </div>
  );
}

function LexicoonPageHeader({ subtitle }: { subtitle: string }) {
  return (
    <header>
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">LexiCoon</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}

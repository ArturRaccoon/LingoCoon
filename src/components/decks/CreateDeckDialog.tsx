'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createDeck } from '@/lib/actions/deck-actions';
import { APP_LANGUAGES } from '@/lib/languages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DeckWithCardCount } from '@/lib/supabase/types';

interface CreateDeckDialogProps {
  onClose: () => void;
  onCreated: (deck: DeckWithCardCount) => void;
}

export function CreateDeckDialog({ onClose, onCreated }: CreateDeckDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [languageFrom, setLanguageFrom] = useState('en');
  const [languageTo, setLanguageTo] = useState('it');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      setError(t('decks.errors.title_required'));
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const result = await createDeck(title.trim(), languageFrom, languageTo);
      if (!result.deck) {
        setError(result.error ?? t('decks.errors.create_failed'));
        return;
      }

      onCreated(result.deck);
    } catch {
      setError(t('decks.errors.create_failed'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-white/10">
      <div
        className="w-full max-w-md rounded-xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-black"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-deck-title"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="create-deck-title" className="text-xl font-bold text-black dark:text-white">
            {t('decks.modal.create_title')}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-black/50 transition-colors hover:bg-black/5 hover:text-black dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label={t('common.cancel')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="deck-title"
              className="mb-2 block text-sm font-medium text-black dark:text-white"
            >
              {t('decks.modal.deck_title')}
            </label>
            <Input
              id="deck-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('decks.modal.title_placeholder')}
              maxLength={100}
              className="border-black/20 bg-transparent focus-visible:ring-black dark:border-white/20 dark:focus-visible:ring-white"
              autoFocus
              disabled={isCreating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <LanguageSelect
              id="deck-language-from"
              label={t('decks.modal.study_language')}
              value={languageFrom}
              excludeValue={languageTo}
              onChange={setLanguageFrom}
              disabled={isCreating}
            />
            <LanguageSelect
              id="deck-language-to"
              label={t('decks.modal.translate_language')}
              value={languageTo}
              excludeValue={languageFrom}
              onChange={setLanguageTo}
              disabled={isCreating}
            />
          </div>

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 border-black/20 text-black hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/5"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !title.trim()}
              className="flex-1 gap-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('decks.modal.creating')}
                </>
              ) : (
                t('decks.modal.create_button')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface LanguageSelectProps {
  disabled: boolean;
  excludeValue: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

function LanguageSelect({
  disabled,
  excludeValue,
  id,
  label,
  onChange,
  value,
}: LanguageSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-black dark:text-white">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-black/20 bg-transparent p-2 text-sm dark:border-white/20 dark:text-white"
        disabled={disabled}
      >
        {APP_LANGUAGES.filter((language) => language.code !== excludeValue).map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.englishName}
          </option>
        ))}
      </select>
    </div>
  );
}

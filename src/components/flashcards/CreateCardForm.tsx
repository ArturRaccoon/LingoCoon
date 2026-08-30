'use client';

import { useState } from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { suggestCardTranslations } from '@/lib/actions/card-translation-actions';
import { createCard } from '@/lib/actions/deck-actions';
import { getTranslatedLanguageName } from '@/lib/translated-language';
import type { CardTranslationSuggestion } from '@/types/card-translation';

interface CreateCardFormProps {
  deckId: string;
  deckLanguage: string;
  languageTo: string;
}

export default function CreateCardForm({
  deckId,
  deckLanguage,
  languageTo,
}: CreateCardFormProps) {
  const { t } = useTranslation();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<CardTranslationSuggestion[]>([]);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!front.trim() || !back.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await createCard(deckId, front, back);
      if (result.error) {
        setError(result.error);
        return;
      }

      setFront('');
      setBack('');
      setSuggestions([]);
    } catch {
      setError(t('flashcards.errors.create_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFrontChange = (value: string) => {
    setFront(value);
    setSuggestions([]);
    setError('');
  };

  const handleSuggestTranslations = async () => {
    if (!front.trim() || isSuggesting || isSubmitting) return;

    setIsSuggesting(true);
    setSuggestions([]);
    setError('');

    try {
      const result = await suggestCardTranslations(deckId, front);
      if (!result.suggestions) {
        setError(getSuggestionError(result.errorKey));
        return;
      }

      setSuggestions(result.suggestions);
    } catch {
      setError(t('flashcards.errors.translation_error'));
    } finally {
      setIsSuggesting(false);
    }
  };

  const getSuggestionError = (errorKey?: string) => {
    if (errorKey === 'invalid_text') {
      return t('flashcards.errors.enter_text_to_translate');
    }

    return t('flashcards.errors.translation_error');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="card-front" className="mb-2 block text-sm font-medium text-gray-700">
          {t('flashcards.form.front_label', 'Word to learn')} ({getTranslatedLanguageName(t, deckLanguage)})
        </label>
        <textarea
          id="card-front"
          value={front}
          onChange={(event) => handleFrontChange(event.target.value)}
          rows={3}
          disabled={isSubmitting || isSuggesting}
          className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          placeholder={t('flashcards.form.front_placeholder', 'Enter word or phrase to learn...')}
        />
        <button
          type="button"
          onClick={handleSuggestTranslations}
          disabled={isSubmitting || isSuggesting || !front.trim()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
        >
          {isSuggesting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('flashcards.form.translating')}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {t('flashcards.form.translate_auto')}
            </>
          )}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {t('flashcards.form.suggestions_title')}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {t('flashcards.form.suggestions_hint')}
            </p>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {suggestions.map((suggestion, index) => {
              const isSelected = back === suggestion.translation;

              return (
                <button
                  key={`${suggestion.translation}-${index}`}
                  type="button"
                  onClick={() => setBack(suggestion.translation)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? 'border-gray-900 bg-white'
                      : 'border-gray-200 bg-white hover:border-gray-400'
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-medium text-gray-900">
                        {suggestion.translation}
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-gray-800">
                        {suggestion.partOfSpeech}
                      </span>
                    </span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-gray-900" />}
                  </span>
                  <span className="mt-2 block text-sm text-gray-600">
                    {suggestion.definition}
                  </span>
                  <span className="mt-2 block text-xs text-gray-500">
                    {suggestion.exampleSentence}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-400">
                    {suggestion.exampleTranslation}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="card-back" className="mb-2 block text-sm font-medium text-gray-700">
          {t('flashcards.form.back_label', 'Translation')} ({getTranslatedLanguageName(t, languageTo)})
        </label>
        <textarea
          id="card-back"
          value={back}
          onChange={(event) => setBack(event.target.value)}
          rows={3}
          disabled={isSubmitting || isSuggesting}
          className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          placeholder={t('flashcards.form.back_placeholder', 'Enter translation...')}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isSuggesting || !front.trim() || !back.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t('flashcards.form.creating', 'Creating...')}</span>
          </>
        ) : (
          t('flashcards.form.create_button', 'Create Card')
        )}
      </button>
    </form>
  );
}

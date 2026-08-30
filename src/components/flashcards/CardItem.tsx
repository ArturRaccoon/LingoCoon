'use client';

import { useState } from 'react';
import { Edit2, Save, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { deleteCard, updateCard } from '@/lib/actions/deck-actions';
import type { Card } from '@/lib/supabase/types';

interface CardItemProps {
  card: Card;
  deckId: string;
  deckLanguage: string;
}

export default function CardItem({ card, deckId, deckLanguage }: CardItemProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!window.confirm(t('flashcards.edit.delete_confirm'))) return;

    setIsDeleting(true);
    setError('');

    try {
      const result = await deleteCard(card.id, deckId);
      if (result.error) setError(result.error);
    } catch {
      setError('Could not delete the card. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!front.trim() || !back.trim() || isSaving) return;

    setIsSaving(true);
    setError('');

    try {
      const result = await updateCard(card.id, deckId, front, back);
      if (result.error) {
        setError(result.error);
        return;
      }

      setIsEditing(false);
    } catch {
      setError('Could not update the card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    setFront(card.front);
    setBack(card.back);
    setError('');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border-2 border-gray-900 bg-white p-5 shadow-md">
        <div className="space-y-3">
          <CardTextInput
            label={`${t('flashcards.edit.front_label')} (${deckLanguage.toUpperCase()})`}
            value={front}
            onChange={setFront}
            placeholder={t('flashcards.edit.front_placeholder')}
            disabled={isSaving}
          />
          <CardTextInput
            label={t('flashcards.edit.back_label')}
            value={back}
            onChange={setBack}
            placeholder={t('flashcards.edit.back_placeholder')}
            disabled={isSaving}
          />

          {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => void handleSave()}
              disabled={isSaving || !front.trim() || !back.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? t('flashcards.edit.saving') : t('flashcards.edit.save')}
            </button>
            <button
              onClick={cancelEditing}
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              {t('flashcards.edit.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md">
      <div className="mb-2 text-lg font-medium text-gray-900">{card.front}</div>
      <div className="border-t border-gray-100 pt-2 text-gray-600">{card.back}</div>
      {card.example_sentence && (
        <p className="mt-2 line-clamp-2 border-t border-gray-100 pt-2 text-xs italic text-gray-400">
          {card.example_sentence}
        </p>
      )}

      <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-lg bg-gray-100 p-2 text-gray-900 transition-colors hover:bg-gray-200"
          aria-label={t('flashcards.edit.edit_title')}
          disabled={isDeleting}
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => void handleDelete()}
          disabled={isDeleting}
          className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50"
          aria-label={t('flashcards.edit.delete_title')}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {error && <div className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}

interface CardTextInputProps {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

function CardTextInput({
  disabled,
  label,
  onChange,
  placeholder,
  value,
}: CardTextInputProps) {
  return (
    <label className="block text-xs font-medium text-gray-700">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-gray-500"
        placeholder={placeholder}
        disabled={disabled}
      />
    </label>
  );
}

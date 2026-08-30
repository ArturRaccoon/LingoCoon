'use client';

import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AiDeckCardList } from '@/components/ai/AiDeckCardList';
import { AiDeckMetadata } from '@/components/ai/AiDeckMetadata';
import type { CardDraft } from '@/components/ai/ai-deck-draft';
import type { GeneratedCard, GeneratedDeck } from '@/types/ai-deck';

interface AiDeckReviewProps {
  deck: GeneratedDeck;
  isSaving: boolean;
  editingId: string | null;
  editDraft: CardDraft;
  isAddingCard: boolean;
  newCardDraft: CardDraft;
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onLanguageChange: (field: 'language_from' | 'language_to', value: string) => void;
  onStartEditing: (card: GeneratedCard) => void;
  onEditDraftChange: (draft: CardDraft) => void;
  onSaveEditing: (cardId: string) => void;
  onCancelEditing: () => void;
  onDeleteCard: (cardId: string) => void;
  onStartAdding: () => void;
  onNewCardDraftChange: (draft: CardDraft) => void;
  onAddCard: () => void;
  onCancelAdding: () => void;
  onSave: () => void;
}

export function AiDeckReview({
  deck,
  isSaving,
  editingId,
  editDraft,
  isAddingCard,
  newCardDraft,
  onBack,
  onTitleChange,
  onLanguageChange,
  onStartEditing,
  onEditDraftChange,
  onSaveEditing,
  onCancelEditing,
  onDeleteCard,
  onStartAdding,
  onNewCardDraftChange,
  onAddCard,
  onCancelAdding,
  onSave,
}: AiDeckReviewProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={isSaving}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
          aria-label="Back to prompt"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{t('ai_deck.review_title')}</h1>
          <p className="text-xs text-gray-400">{t('ai_deck.review_subtitle')}</p>
        </div>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-400">
          {t('ai_deck.cards_count', { count: deck.cards.length })}
        </span>
      </div>

      <AiDeckMetadata
        deck={deck}
        disabled={isSaving}
        onTitleChange={onTitleChange}
        onLanguageChange={onLanguageChange}
      />

      <AiDeckCardList
        cards={deck.cards}
        editingId={editingId}
        editDraft={editDraft}
        isAddingCard={isAddingCard}
        newCardDraft={newCardDraft}
        disabled={isSaving}
        onStartEditing={onStartEditing}
        onEditDraftChange={onEditDraftChange}
        onSaveEditing={onSaveEditing}
        onCancelEditing={onCancelEditing}
        onDeleteCard={onDeleteCard}
        onStartAdding={onStartAdding}
        onNewCardDraftChange={onNewCardDraftChange}
        onAddCard={onAddCard}
        onCancelAdding={onCancelAdding}
      />

      <button
        onClick={onSave}
        disabled={isSaving || deck.cards.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-40"
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {isSaving
          ? t('ai_deck.saving_button')
          : t('ai_deck.save_button', { count: deck.cards.length })}
      </button>
    </div>
  );
}

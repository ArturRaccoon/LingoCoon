'use client';

import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AiDeckCardDraftForm } from '@/components/ai/AiDeckCardDraftForm';
import { AiDeckCardRow } from '@/components/ai/AiDeckCardRow';
import type { CardDraft } from '@/components/ai/ai-deck-draft';
import type { GeneratedCard } from '@/types/ai-deck';

interface AiDeckCardListProps {
  cards: GeneratedCard[];
  editingId: string | null;
  editDraft: CardDraft;
  isAddingCard: boolean;
  newCardDraft: CardDraft;
  disabled: boolean;
  onStartEditing: (card: GeneratedCard) => void;
  onEditDraftChange: (draft: CardDraft) => void;
  onSaveEditing: (cardId: string) => void;
  onCancelEditing: () => void;
  onDeleteCard: (cardId: string) => void;
  onStartAdding: () => void;
  onNewCardDraftChange: (draft: CardDraft) => void;
  onAddCard: () => void;
  onCancelAdding: () => void;
}

export function AiDeckCardList({
  cards,
  editingId,
  editDraft,
  isAddingCard,
  newCardDraft,
  disabled,
  onStartEditing,
  onEditDraftChange,
  onSaveEditing,
  onCancelEditing,
  onDeleteCard,
  onStartAdding,
  onNewCardDraftChange,
  onAddCard,
  onCancelAdding,
}: AiDeckCardListProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="space-y-2">
        {cards.map((card, index) => (
          <AiDeckCardRow
            key={card.localId}
            card={card}
            index={index}
            isEditing={editingId === card.localId}
            editDraft={editDraft}
            disabled={disabled}
            onStartEdit={() => onStartEditing(card)}
            onDraftChange={onEditDraftChange}
            onSaveEdit={() => onSaveEditing(card.localId)}
            onCancelEdit={onCancelEditing}
            onDelete={() => onDeleteCard(card.localId)}
          />
        ))}
      </div>

      {isAddingCard ? (
        <AiDeckCardDraftForm
          draft={newCardDraft}
          disabled={disabled}
          title={t('ai_deck.new_card_label')}
          saveLabel={t('ai_deck.add_card')}
          onDraftChange={onNewCardDraftChange}
          onSave={onAddCard}
          onCancel={onCancelAdding}
        />
      ) : (
        <button
          onClick={onStartAdding}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-400 transition-all hover:border-gray-400 hover:text-gray-600 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          {t('ai_deck.add_card_button')}
        </button>
      )}
    </>
  );
}

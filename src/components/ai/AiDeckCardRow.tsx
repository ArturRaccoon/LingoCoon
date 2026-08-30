'use client';

import type { ReactNode } from 'react';
import { ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AiDeckCardDraftForm } from '@/components/ai/AiDeckCardDraftForm';
import type { CardDraft } from '@/components/ai/ai-deck-draft';
import type { GeneratedCard } from '@/types/ai-deck';

interface AiDeckCardRowProps {
  card: GeneratedCard;
  disabled: boolean;
  editDraft: CardDraft;
  index: number;
  isEditing: boolean;
  onCancelEdit: () => void;
  onDelete: () => void;
  onDraftChange: (draft: CardDraft) => void;
  onSaveEdit: () => void;
  onStartEdit: () => void;
}

export function AiDeckCardRow({
  card,
  disabled,
  editDraft,
  index,
  isEditing,
  onCancelEdit,
  onDelete,
  onDraftChange,
  onSaveEdit,
  onStartEdit,
}: AiDeckCardRowProps) {
  const { t } = useTranslation();

  if (isEditing) {
    return (
      <AiDeckCardDraftForm
        draft={editDraft}
        disabled={disabled}
        onDraftChange={onDraftChange}
        onCancel={onCancelEdit}
        onSave={onSaveEdit}
      />
    );
  }

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:border-gray-200">
      <span className="mt-0.5 w-5 flex-shrink-0 select-none text-right text-xs text-gray-300">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-medium text-gray-900">{card.front}</span>
          <ArrowRight className="h-3 w-3 text-gray-300" />
          <span className="text-sm text-gray-600">{card.back}</span>
        </div>
        {card.example_sentence && (
          <p className="mt-0.5 line-clamp-1 text-xs italic text-gray-400">
            {card.example_sentence}
          </p>
        )}
      </div>
      <div className="flex flex-shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <IconButton
          label={t('ai_deck.edit_card_label', { number: index + 1 })}
          disabled={disabled}
          onClick={onStartEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          label={t('ai_deck.delete_card_label', { number: index + 1 })}
          disabled={disabled}
          danger
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>
    </div>
  );
}

function IconButton({
  label,
  disabled,
  danger = false,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`rounded-lg p-1.5 text-gray-400 transition-colors disabled:opacity-30 ${
        danger ? 'hover:bg-red-50 hover:text-red-500' : 'hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

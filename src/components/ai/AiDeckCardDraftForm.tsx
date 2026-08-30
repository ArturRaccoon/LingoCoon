'use client';

import { useTranslation } from 'react-i18next';
import { AiDeckDraftButton } from '@/components/ai/AiDeckDraftButton';
import { AiDeckDraftInput } from '@/components/ai/AiDeckDraftInput';
import { canSaveCardDraft } from '@/components/ai/ai-deck-draft';
import type { CardDraft } from '@/components/ai/ai-deck-draft';

interface AiDeckCardDraftFormProps {
  draft: CardDraft;
  disabled: boolean;
  title?: string;
  saveLabel?: string;
  onDraftChange: (draft: CardDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AiDeckCardDraftForm({
  draft,
  disabled,
  title,
  saveLabel,
  onDraftChange,
  onSave,
  onCancel,
}: AiDeckCardDraftFormProps) {
  const { t } = useTranslation();
  const canSave = canSaveCardDraft(draft);

  return (
    <div className="space-y-2.5 rounded-xl border border-gray-400 bg-gray-50 p-4">
      {title && <p className="text-xs font-semibold text-gray-900">{title}</p>}
      <div className="grid grid-cols-2 gap-2">
        <AiDeckDraftInput
          autoFocus
          value={draft.front}
          disabled={disabled}
          placeholder={t('ai_deck.front_placeholder')}
          onChange={(front) => onDraftChange({ ...draft, front })}
        />
        <AiDeckDraftInput
          value={draft.back}
          disabled={disabled}
          placeholder={t('ai_deck.back_placeholder')}
          onChange={(back) => onDraftChange({ ...draft, back })}
        />
      </div>
      <AiDeckDraftInput
        value={draft.example_sentence}
        disabled={disabled}
        placeholder={t('ai_deck.example_placeholder')}
        onChange={(example_sentence) => onDraftChange({ ...draft, example_sentence })}
        fullWidth
      />
      <div className="flex justify-end gap-3 pt-1">
        <AiDeckDraftButton onClick={onCancel} label={t('ai_deck.cancel')} disabled={disabled} />
        <AiDeckDraftButton
          onClick={onSave}
          label={saveLabel ?? t('ai_deck.save_card')}
          primary
          disabled={disabled || !canSave}
        />
      </div>
    </div>
  );
}

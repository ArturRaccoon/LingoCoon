'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { generateFlashcardDeckWithAi } from '@/lib/actions/ai-actions';
import { createDeckWithCards } from '@/lib/actions/deck-actions';
import { AiDeckPrompt } from '@/components/ai/AiDeckPrompt';
import { AiDeckReview } from '@/components/ai/AiDeckReview';
import { AiDeckErrorState, AiDeckGeneratingState } from '@/components/ai/AiDeckStatus';
import {
  addGeneratedCard,
  canSaveCardDraft,
  createCardDraft,
  createEmptyCardDraft,
  removeGeneratedCard,
  updateGeneratedCard,
} from '@/components/ai/ai-deck-draft';
import type { CardDraft } from '@/components/ai/ai-deck-draft';
import type { GeneratedCard, GeneratedDeck } from '@/types/ai-deck';

type Phase = 'prompt' | 'generating' | 'review' | 'saving' | 'error';

interface AiDeckGeneratorProps {
  currentLevel: string | null;
  learningPurpose: string | null;
  learningPurposeDetails: string | null;
  nativeLanguage: string | null;
  targetLanguage: string | null;
}

export default function AiDeckGenerator({
  currentLevel,
  learningPurpose,
  learningPurposeDetails,
  nativeLanguage,
  targetLanguage,
}: AiDeckGeneratorProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('prompt');
  const [prompt, setPrompt] = useState('');
  const [deck, setDeck] = useState<GeneratedDeck | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<CardDraft>(createEmptyCardDraft);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardDraft, setNewCardDraft] = useState<CardDraft>(createEmptyCardDraft);

  const handleGenerate = async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || phase === 'generating') return;

    setPhase('generating');
    setErrorMessage(null);

    try {
      const result = await generateFlashcardDeckWithAi(cleanPrompt);
      if (result.errorKey || !result.deck) {
        setErrorMessage(t(`ai_deck.errors.${result.errorKey ?? 'service_unavailable'}`));
        setPhase('error');
        return;
      }

      setDeck(result.deck);
      setPhase('review');
    } catch {
      setErrorMessage(t('ai_deck.errors.service_unavailable'));
      setPhase('error');
    }
  };

  const startEditing = (card: GeneratedCard) => {
    setIsAddingCard(false);
    setEditingId(card.localId);
    setEditDraft(createCardDraft(card));
  };

  const saveEditing = (cardId: string) => {
    if (!deck) return;

    setDeck(updateGeneratedCard(deck, cardId, editDraft));
    setEditingId(null);
  };

  const deleteCard = (cardId: string) => {
    if (!deck) return;

    setDeck(removeGeneratedCard(deck, cardId));
    if (editingId === cardId) setEditingId(null);
  };

  const addCard = () => {
    if (!deck || !canSaveCardDraft(newCardDraft)) return;

    setDeck(addGeneratedCard(deck, newCardDraft));
    cancelAdding();
  };

  const cancelAdding = () => {
    setIsAddingCard(false);
    setNewCardDraft(createEmptyCardDraft());
  };

  const handleSave = async () => {
    if (!deck || deck.cards.length === 0 || phase === 'saving') return;

    setPhase('saving');

    try {
      const result = await createDeckWithCards(
        deck.title,
        deck.language_from,
        deck.language_to,
        deck.cards.map(({ front, back, example_sentence }) => ({
          front,
          back,
          example_sentence,
        })),
      );

      if (result.error || !result.deck) {
        setErrorMessage(t('ai_deck.errors.save_failed'));
        setPhase('error');
        return;
      }

      router.push(`/decks/${result.deck.id}`);
    } catch {
      setErrorMessage(t('ai_deck.errors.save_failed'));
      setPhase('error');
    }
  };

  if (phase === 'generating') {
    return <AiDeckGeneratingState />;
  }

  if (phase === 'error') {
    return (
      <AiDeckErrorState
        message={errorMessage}
        onBack={() => setPhase(deck ? 'review' : 'prompt')}
      />
    );
  }

  if ((phase === 'review' || phase === 'saving') && deck) {
    return (
      <AiDeckReview
        deck={deck}
        isSaving={phase === 'saving'}
        editingId={editingId}
        editDraft={editDraft}
        isAddingCard={isAddingCard}
        newCardDraft={newCardDraft}
        onBack={() => setPhase('prompt')}
        onTitleChange={(title) => setDeck({ ...deck, title })}
        onLanguageChange={(field, value) => setDeck({ ...deck, [field]: value })}
        onStartEditing={startEditing}
        onEditDraftChange={setEditDraft}
        onSaveEditing={saveEditing}
        onCancelEditing={() => setEditingId(null)}
        onDeleteCard={deleteCard}
        onStartAdding={() => {
          setIsAddingCard(true);
          setEditingId(null);
        }}
        onNewCardDraftChange={setNewCardDraft}
        onAddCard={addCard}
        onCancelAdding={cancelAdding}
        onSave={handleSave}
      />
    );
  }

  return (
    <AiDeckPrompt
      prompt={prompt}
      currentLevel={currentLevel}
      learningPurpose={learningPurpose}
      learningPurposeDetails={learningPurposeDetails}
      nativeLanguage={nativeLanguage}
      targetLanguage={targetLanguage}
      onPromptChange={setPrompt}
      onGenerate={handleGenerate}
    />
  );
}

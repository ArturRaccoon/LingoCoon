'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Rating } from 'ts-fsrs';
import { sendTutorConversation } from '@/lib/actions/ai-actions';
import { rateCard } from '@/lib/actions/deck-actions';
import { appendTranscript } from '@/lib/transcript';
import AiPanel from '@/components/study/AiPanel';
import { ClassicStudyCard } from '@/components/study/ClassicStudyCard';
import { ClassicStudyCompletion } from '@/components/study/ClassicStudyCompletion';
import type { Deck } from '@/lib/supabase/types';
import type { ChatMessage } from '@/types/chat';
import type { SessionCard } from '@/types/study';
import type { ConversationTurn } from '@/types/ai';

interface StudySessionProps {
  cards: SessionCard[];
  deck: Deck;
  nativeLanguage: string;
}

export default function StudySession({ cards, deck, nativeLanguage }: StudySessionProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [aiHistory, setAiHistory] = useState<ConversationTurn[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const currentCard = cards[currentIndex];

  const handleRate = async (rating: Rating) => {
    if (!currentCard || isRating) return;

    setIsRating(true);
    setRatingError(null);

    try {
      const result = await rateCard(currentCard.id, rating);
      if (result.error) {
        setRatingError(t('study.rating_save_error'));
        return;
      }

      if (currentIndex === cards.length - 1) {
        setSessionComplete(true);
      } else {
        setCurrentIndex((previous) => previous + 1);
        setIsFlipped(false);
        setAiMessages([]);
        setAiHistory([]);
      }
    } catch {
      setRatingError(t('study.rating_save_error'));
    } finally {
      setIsRating(false);
    }
  };

  const handleAiSend = async () => {
    const text = aiInput.trim();
    if (!text || !currentCard || isAiLoading) return;

    const userTurn: ConversationTurn = { role: 'user', parts: [{ text }] };
    const updatedHistory = [...aiHistory, userTurn];

    setAiMessages((previous) => [...previous, { role: 'user', text }]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const response = await sendTutorConversation({
        operation: 'classic_study',
        deckId: deck.id,
        cardId: currentCard.id,
        history: updatedHistory,
      });
      setAiHistory([
        ...updatedHistory,
        { role: 'model', parts: [{ text: response }] },
      ]);
      setAiMessages((previous) => [...previous, { role: 'ai', text: response }]);
    } catch {
      setAiMessages((previous) => [...previous, { role: 'ai', text: t('study.ai_error') }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!currentCard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Link href={`/decks/${deck.id}`} className="text-sm text-gray-900 underline">
          {t('study.back_to_deck')}
        </Link>
      </div>
    );
  }

  if (sessionComplete) {
    return <ClassicStudyCompletion cardCount={cards.length} deckId={deck.id} />;
  }

  const progressPercent = Math.round((currentIndex / cards.length) * 100);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <Link
            href={`/decks/${deck.id}`}
            className="text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            &larr; {deck.title}
          </Link>
          <span className="text-sm text-gray-400">
            {t('study.progress', { current: currentIndex + 1, total: cards.length })}
          </span>
          <button
            onClick={() => setIsAiOpen((previous) => !previous)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              isAiOpen
                ? 'border-black bg-black text-white'
                : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
            }`}
          >
            {t('study.ai_tutor_label')}
          </button>
        </div>

        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-black transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          <ClassicStudyCard
            card={currentCard}
            deckLanguage={deck.language_from}
            isFlipped={isFlipped}
            isRating={isRating}
            onFlip={() => setIsFlipped(true)}
            onRate={(rating) => void handleRate(rating)}
            ratingError={ratingError}
          />
        </div>
      </div>

      {isAiOpen && (
        <div className="w-80 flex-shrink-0">
          <AiPanel
            messages={aiMessages}
            input={aiInput}
            loading={isAiLoading}
            nativeLanguage={nativeLanguage}
            onInputChange={setAiInput}
            onSend={() => void handleAiSend()}
            onTranscript={(text) => setAiInput((previous) => appendTranscript(previous, text))}
            speechLanguageCode={deck.language_from}
          />
        </div>
      )}
    </div>
  );
}

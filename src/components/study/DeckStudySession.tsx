'use client';

import { useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { sendTutorConversation } from '@/lib/actions/ai-actions';
import { rateCard } from '@/lib/actions/deck-actions';
import { getChatInputLengthError } from '@/lib/chat';
import {
  getDeckStudyDisplayCard,
  getHardStudyCards,
  toFsrsRating,
} from '@/lib/deck-study';
import { appendTranscript } from '@/lib/transcript';
import { useTtsAudio } from '@/hooks/useTtsAudio';
import { DeckStudyCompletion } from '@/components/study/DeckStudyCompletion';
import type { DeckStudySessionStats } from '@/components/study/DeckStudyCompletion';
import { DeckStudyEmpty } from '@/components/study/DeckStudyEmpty';
import { DeckStudyFlashcard } from '@/components/study/DeckStudyFlashcard';
import { DeckStudyNavigation } from '@/components/study/DeckStudyNavigation';
import { DeckStudyRatings } from '@/components/study/DeckStudyRatings';
import type { CardRating } from '@/components/study/DeckStudyRatings';
import { DeckStudyTutor } from '@/components/study/DeckStudyTutor';
import type { Card, Deck } from '@/lib/supabase/types';
import type { ConversationTurn } from '@/types/ai';

interface DeckStudySessionProps {
  cards: Card[];
  deck: Deck;
  deckId: string;
  nativeLanguage: string;
}

export default function DeckStudySession({
  cards,
  deck,
  deckId,
  nativeLanguage,
}: DeckStudySessionProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardRatings, setCardRatings] = useState<Record<string, CardRating>>({});
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState<DeckStudySessionStats | null>(null);
  const [aiHistory, setAiHistory] = useState<ConversationTurn[]>([]);
  const [userInput, setUserInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const aiRequestInFlight = useRef(false);
  const { isAudioLoading, playAudio, stopAudio } = useTtsAudio();

  const currentCard = cards[currentIndex];
  const displayCard = getDeckStudyDisplayCard(currentCard, deck, nativeLanguage);
  const finishSession = (finalRatings: Record<string, CardRating>) => {
    setSessionComplete(true);
    const hardCards = getHardStudyCards(cards, finalRatings);
    setSessionStats({ hardCards });
  };

  const handleRate = async (rating: CardRating) => {
    if (!currentCard || isSavingRating) return;

    setIsSavingRating(true);
    setSessionError(null);
    const updatedRatings = { ...cardRatings, [currentCard.id]: rating };

    try {
      const result = await rateCard(currentCard.id, toFsrsRating(rating));
      if (result.error) {
        setSessionError(t('study.rating_save_error'));
        return;
      }

      setCardRatings(updatedRatings);
      if (currentIndex === cards.length - 1) {
        finishSession(updatedRatings);
      } else {
        setCurrentIndex((index) => index + 1);
        resetCardUi();
      }
    } catch {
      setSessionError(t('study.rating_save_error'));
    } finally {
      setIsSavingRating(false);
    }
  };

  const sendToAi = async (message: string) => {
    if (aiRequestInFlight.current) return;

    const lengthError = getChatInputLengthError(message);
    if (lengthError) {
      setSessionError(lengthError);
      return;
    }

    aiRequestInFlight.current = true;
    setSessionError(null);
    const userTurn: ConversationTurn = { role: 'user', parts: [{ text: message }] };
    const updatedHistory = [...aiHistory, userTurn];
    setAiHistory(updatedHistory);
    setAiLoading(true);

    try {
      const reply = await sendTutorConversation({
        operation: 'deck_study',
        deckId,
        cardId: currentCard.id,
        history: updatedHistory,
      });
      setAiHistory((history) => [...history, { role: 'model', parts: [{ text: reply }] }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('study.ai_error');
      setSessionError(message);
    } finally {
      aiRequestInFlight.current = false;
      setAiLoading(false);
    }
  };

  const handleExplain = () => {
    if (aiLoading || !currentCard) return;
    void sendToAi(
      `Explain "${currentCard.front}" (translation: "${currentCard.back}"). Give one example sentence.`,
    );
  };

  const handleAiSend = () => {
    const message = userInput.trim();
    if (!message || aiLoading) return;

    setUserInput('');
    void sendToAi(message);
  };

  const restartSession = () => {
    setSessionComplete(false);
    setSessionStats(null);
    setCardRatings({});
    setCurrentIndex(0);
    resetCardUi();
    setSessionError(null);
  };

  function resetCardUi() {
    setIsFlipped(false);
    setAiHistory([]);
    setUserInput('');
  }

  if (!currentCard || cards.length === 0) {
    return <DeckStudyEmpty deckId={deckId} />;
  }

  if (sessionComplete) {
    return (
      <DeckStudyCompletion
        deckId={deckId}
        deckTitle={deck.title}
        stats={sessionStats}
        onStudyAgain={restartSession}
      />
    );
  }

  return (
    <div className="container mx-auto max-w-sm p-6">
      <DeckStudyNavigation
        currentIndex={currentIndex}
        deckId={deckId}
        onRestart={() => {
          setCurrentIndex(0);
          resetCardUi();
        }}
        totalCards={cards.length}
      />

      <DeckStudyFlashcard
        back={displayCard.back}
        exampleSentence={currentCard.example_sentence}
        front={displayCard.front}
        isAudioLoading={isAudioLoading}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
        onPlayBack={(event) => playCardAudio(event, displayCard.back, displayCard.backLanguage)}
        onPlayFront={(event) => playCardAudio(event, displayCard.front, displayCard.frontLanguage)}
      />

      {isFlipped && (
        <>
          <DeckStudyRatings disabled={isSavingRating} onRate={handleRate} />
          <DeckStudyTutor
            history={aiHistory}
            input={userInput}
            isLoading={aiLoading}
            onExplain={handleExplain}
            onInputChange={setUserInput}
            onRecordingStart={stopAudio}
            onSend={handleAiSend}
            onTranscript={(text) => setUserInput((previous) => appendTranscript(previous, text))}
            speechLanguageCode={deck.language_from}
          />
        </>
      )}

      {sessionError && <p className="mt-4 text-center text-sm text-red-600">{sessionError}</p>}
      {!isFlipped && (
        <p className="mt-2 text-center text-xs text-gray-400">
          {t('study_session.evaluation.tap_to_reveal')}
        </p>
      )}
    </div>
  );

  function playCardAudio(event: MouseEvent, text: string, languageCode: string) {
    event.stopPropagation();
    void playAudio({ text, languageCode, speed: 0.9 });
  }
}

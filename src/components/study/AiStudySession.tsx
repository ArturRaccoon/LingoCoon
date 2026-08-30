'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendConversationToAiTutor } from '@/lib/actions/ai-actions';
import { parseAiStudyReply } from '@/lib/ai-response';
import {
  createConversationTurn,
  createFallbackAiStudyReply,
  createPendingStudyTransition,
  getAiStudyProgressPercent,
  shouldSaveAiStudyRating,
  toAiStudyFsrsRating,
} from '@/lib/ai-study-session';
import type { PendingStudyTransition } from '@/lib/ai-study-session';
import { buildAiStudySystemPrompt } from '@/lib/ai-study';
import { getChatInputLengthError } from '@/lib/chat';
import { appendTranscript } from '@/lib/transcript';
import { useAiStudyRatingPersistence } from '@/hooks/useAiStudyRatingPersistence';
import { useAutoPlayLatestAiMessage } from '@/hooks/useAutoPlayLatestAiMessage';
import { useTtsAudio } from '@/hooks/useTtsAudio';
import { AiStudyChatView } from '@/components/study/AiStudyChatView';
import { AiStudyCompletion } from '@/components/study/AiStudyCompletion';
import type { ConversationTurn } from '@/types/ai';
import type { Deck } from '@/lib/supabase/types';
import type { ChatMessage } from '@/types/chat';
import type { SessionCard } from '@/types/study';
import type { TtsVoicePreset } from '@/lib/tts';

interface AiStudySessionProps {
  cards: SessionCard[];
  deck: Deck;
  nativeLanguage: string;
}

export default function AiStudySession({
  cards,
  deck,
  nativeLanguage,
}: AiStudySessionProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [pendingTransition, setPendingTransition] = useState<PendingStudyTransition | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [voice, setVoice] = useState<TtsVoicePreset>('female');

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const systemPromptRef = useRef(buildAiStudySystemPrompt(cards, deck, nativeLanguage));
  const hasStartedRef = useRef(false);
  const completionTimerRef = useRef<number | null>(null);
  const { loadingRequestId, playAudio, stopAudio } = useTtsAudio();
  const {
    hasPendingRating,
    isSavingRating,
    retryPendingRating,
    saveRating,
    skipPendingRating,
  } = useAiStudyRatingPersistence();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePlayAudio = useCallback((text: string, messageIndex: number) => {
    void playAudio({ text, speed: 0.95, voice }, `message-${messageIndex}`);
  }, [playAudio, voice]);

  useAutoPlayLatestAiMessage({
    autoPlay,
    isLoading,
    messages,
    onPlayAudio: handlePlayAudio,
  });

  useEffect(() => () => {
    if (completionTimerRef.current !== null) {
      window.clearTimeout(completionTimerRef.current);
    }
  }, []);

  const showCompletionSoon = useCallback(() => {
    if (completionTimerRef.current !== null) {
      window.clearTimeout(completionTimerRef.current);
    }

    completionTimerRef.current = window.setTimeout(() => {
      setSessionComplete(true);
    }, 2000);
  }, []);

  const finishTransition = useCallback((transition: PendingStudyTransition) => {
    setPendingTransition(null);

    if (transition.nextCardIndex !== null) {
      setCurrentCardIndex(transition.nextCardIndex);
    }
    if (transition.sessionComplete) {
      showCompletionSoon();
    }
  }, [showCompletionSoon]);

  const retrySaving = useCallback(async () => {
    if (!pendingTransition) return;

    if (await retryPendingRating()) {
      finishTransition(pendingTransition);
    }
  }, [finishTransition, pendingTransition, retryPendingRating]);

  const continueWithoutSaving = useCallback(() => {
    if (!pendingTransition) return;

    skipPendingRating();
    finishTransition(pendingTransition);
  }, [finishTransition, pendingTransition, skipPendingRating]);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const startSession = async () => {
      setIsLoading(true);

      try {
        const startTurn = createConversationTurn('user', 'Start the session.');
        const initialHistory = [startTurn];
        const rawResponse = await sendConversationToAiTutor(systemPromptRef.current, initialHistory);
        const aiTurn = createConversationTurn('model', rawResponse);

        setHistory([...initialHistory, aiTurn]);
        setMessages([{
          role: 'ai',
          text: parseAiStudyReply(rawResponse)?.message ?? rawResponse,
        }]);
      } catch {
        setMessages([{ role: 'ai', text: t('study.ai_mode.start_error') }]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    };

    void startSession();
  }, [t]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading || isSavingRating) return;

    let cardIndexForResponse = currentCardIndex;
    if (pendingTransition) {
      skipPendingRating();
      finishTransition(pendingTransition);
      if (pendingTransition.sessionComplete) return;

      cardIndexForResponse = pendingTransition.nextCardIndex ?? currentCardIndex;
    }

    const lengthError = getChatInputLengthError(text);
    if (lengthError) {
      setMessages((previous) => [...previous, { role: 'ai', text: lengthError }]);
      return;
    }

    const userTurn = createConversationTurn('user', text);
    const newHistory = [...history, userTurn];

    setMessages((previous) => [...previous, { role: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      const rawResponse = await sendConversationToAiTutor(systemPromptRef.current, newHistory);
      const parsed = parseAiStudyReply(rawResponse) ?? createFallbackAiStudyReply(rawResponse);
      const aiTurn = createConversationTurn('model', rawResponse);

      setHistory([...newHistory, aiTurn]);
      setMessages((previous) => [...previous, { role: 'ai', text: parsed.message }]);

      if (shouldSaveAiStudyRating(parsed)) {
        const transition = createPendingStudyTransition(
          parsed,
          cardIndexForResponse,
          cards.length,
        );
        const currentCard = cards[cardIndexForResponse];

        if (currentCard) {
          const ratingSaved = await saveRating(
            currentCard.id,
            toAiStudyFsrsRating(parsed.rating),
          );

          if (ratingSaved) {
            finishTransition(transition);
          } else {
            setPendingTransition(transition);
          }
        }
      }
    } catch {
      setMessages((previous) => [...previous, {
        role: 'ai',
        text: t('study.ai_mode.ai_error'),
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  if (sessionComplete) {
    return <AiStudyCompletion cardCount={cards.length} deckId={deck.id} />;
  }

  const progressPercent = getAiStudyProgressPercent(currentCardIndex, cards.length);

  return (
    <AiStudyChatView
      autoPlay={autoPlay}
      currentCardIndex={currentCardIndex}
      deckId={deck.id}
      deckTitle={deck.title}
      input={input}
      inputRef={inputRef}
      isLoading={isLoading}
      isSavingRating={isSavingRating}
      loadingAudioRequestId={loadingRequestId}
      messages={messages}
      messagesEndRef={messagesEndRef}
      onInputChange={setInput}
      onContinueWithoutSaving={continueWithoutSaving}
      onPlayAudio={handlePlayAudio}
      onRecordingStart={stopAudio}
      onRetrySaving={() => void retrySaving()}
      onSend={() => void handleSend()}
      onTranscript={(text) => setInput((previous) => appendTranscript(previous, text))}
      onToggleAutoPlay={() => setAutoPlay((previous) => !previous)}
      onVoiceChange={setVoice}
      progressPercent={progressPercent}
      ratingSaveError={hasPendingRating ? t('study.ai_mode.rating_save_error') : null}
      totalCards={cards.length}
      voice={voice}
      speechLanguageCode={deck.language_from}
    />
  );
}

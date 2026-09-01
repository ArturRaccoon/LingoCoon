'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendTutorConversation } from '@/lib/actions/ai-actions';
import { getChatInputLengthError } from '@/lib/chat';
import { appendTranscript } from '@/lib/transcript';
import { useAutoPlayLatestAiMessage } from '@/hooks/useAutoPlayLatestAiMessage';
import { useTtsAudio } from '@/hooks/useTtsAudio';
import { GeneralChatView } from '@/components/ai/GeneralChatView';
import type { TtsVoicePreset } from '@/lib/tts';
import type { ConversationTurn } from '@/types/ai';
import type { ChatMessage } from '@/types/chat';

interface GeneralChatProps {
  nativeLanguage: string | null;
  targetLanguage: string | null;
}

export default function GeneralChat({ nativeLanguage, targetLanguage }: GeneralChatProps) {
  const { t } = useTranslation();
  const welcomeMessage = t('chat.welcome');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: welcomeMessage },
  ]);
  const [history, setHistory] = useState<ConversationTurn[]>([
    { role: 'model', parts: [{ text: welcomeMessage }] },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [voice, setVoice] = useState<TtsVoicePreset>('female');
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);
  const { loadingRequestId, playAudio, stopAudio } = useTtsAudio();

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

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSendingRef.current) return;

    const lengthError = getChatInputLengthError(text);
    if (lengthError) {
      setMessages((previous) => [...previous, { role: 'ai', text: lengthError }]);
      return;
    }

    const userTurn: ConversationTurn = { role: 'user', parts: [{ text }] };
    const updatedHistory = [...history, userTurn];

    isSendingRef.current = true;
    setMessages((previous) => [...previous, { role: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendTutorConversation({
        operation: 'general_chat',
        history: updatedHistory,
      });
      const aiTurn: ConversationTurn = { role: 'model', parts: [{ text: reply }] };

      setHistory([...updatedHistory, aiTurn]);
      setMessages((previous) => [...previous, { role: 'ai', text: reply }]);
    } catch (error) {
      setMessages((previous) => [...previous, {
        role: 'ai',
        text: error instanceof Error ? error.message : t('chat.error'),
      }]);
    } finally {
      isSendingRef.current = false;
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <GeneralChatView
      autoPlay={autoPlay}
      input={input}
      inputRef={inputRef}
      isLoading={isLoading}
      loadingAudioRequestId={loadingRequestId}
      messages={messages}
      messagesEndRef={messagesEndRef}
      onInputChange={setInput}
      onPlayAudio={handlePlayAudio}
      onRecordingStart={stopAudio}
      onSend={() => void handleSend()}
      onTranscript={(text) => setInput((previous) => appendTranscript(previous, text))}
      onToggleAutoPlay={() => setAutoPlay((previous) => !previous)}
      onVoiceChange={setVoice}
      voice={voice}
      speechLanguageCode={targetLanguage ?? nativeLanguage ?? 'en'}
    />
  );
}

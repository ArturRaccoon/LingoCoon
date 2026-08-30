'use client';

import type { KeyboardEvent, RefObject } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TypingDots from '@/components/ui/TypingDots';
import { MAX_CHAT_INPUT_LENGTH } from '@/lib/chat';
import { VoiceControls } from '@/components/tts/VoiceControls';
import { SpeechInputButton } from '@/components/stt/SpeechInputButton';
import type { ChatMessage } from '@/types/chat';
import type { TtsVoicePreset } from '@/lib/tts';

interface AiStudyChatViewProps {
  autoPlay: boolean;
  currentCardIndex: number;
  deckId: string;
  deckTitle: string;
  input: string;
  inputRef: RefObject<HTMLInputElement | null>;
  isLoading: boolean;
  isSavingRating: boolean;
  loadingAudioRequestId: string | null;
  messages: ChatMessage[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onContinueWithoutSaving: () => void;
  onInputChange: (value: string) => void;
  onPlayAudio: (text: string, index: number) => void;
  onRecordingStart: () => void;
  onRetrySaving: () => void;
  onSend: () => void;
  onTranscript: (text: string) => void;
  onToggleAutoPlay: () => void;
  onVoiceChange: (voice: TtsVoicePreset) => void;
  progressPercent: number;
  ratingSaveError: string | null;
  totalCards: number;
  voice: TtsVoicePreset;
  speechLanguageCode: string;
}

export function AiStudyChatView({
  autoPlay,
  currentCardIndex,
  deckId,
  deckTitle,
  input,
  inputRef,
  isLoading,
  isSavingRating,
  loadingAudioRequestId,
  messages,
  messagesEndRef,
  onContinueWithoutSaving,
  onInputChange,
  onPlayAudio,
  onRecordingStart,
  onRetrySaving,
  onSend,
  onTranscript,
  onToggleAutoPlay,
  onVoiceChange,
  progressPercent,
  ratingSaveError,
  totalCards,
  voice,
  speechLanguageCode,
}: AiStudyChatViewProps) {
  const { t } = useTranslation();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;

    event.preventDefault();
    onSend();
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
        <Link
          href={`/decks/${deckId}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{deckTitle}</span>
        </Link>

        <div className="flex items-center gap-3">
          <VoiceControls
            autoPlay={autoPlay}
            onToggleAutoPlay={onToggleAutoPlay}
            onVoiceChange={onVoiceChange}
            voice={voice}
          />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-gray-500" />
            <span className="text-sm font-medium text-gray-900">{t('study.ai_mode.badge')}</span>
          </div>
        </div>

        <span className="text-sm text-gray-400">
          {t('study.progress', {
            current: Math.min(currentCardIndex + 1, totalCards),
            total: totalCards,
          })}
        </span>
      </div>

      <div className="h-0.5 flex-shrink-0 bg-gray-100">
        <div
          className="h-0.5 bg-black transition-all duration-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 && isLoading && <ThinkingBubble />}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'ai' && <AiAvatar />}
            <div className="flex max-w-[75%] flex-col gap-1">
              <div className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'rounded-tr-sm bg-gray-900 text-white'
                  : 'rounded-tl-sm border border-gray-200 bg-gray-100 text-gray-800'
              }`}>
                {message.text}
              </div>
              {message.role === 'ai' && (
                <button
                  onClick={() => onPlayAudio(message.text, index)}
                  disabled={loadingAudioRequestId !== null}
                  aria-label={t('tts.play_audio')}
                  className="ml-1 self-start rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:opacity-30"
                >
                  {loadingAudioRequestId === `message-${index}`
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Volume2 className="h-3.5 w-3.5" />
                  }
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages.length > 0 && <ThinkingBubble withAvatar />}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 border-t border-gray-200 px-4 py-4">
        {ratingSaveError && (
          <div className="mx-auto mb-3 flex max-w-3xl items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <span>{ratingSaveError}</span>
            <div className="flex flex-shrink-0 gap-3">
              <button
                onClick={onRetrySaving}
                disabled={isSavingRating}
                className="font-semibold underline disabled:opacity-50"
              >
                {isSavingRating
                  ? t('onboarding.saving')
                  : t('common.retry', { defaultValue: 'Retry' })}
              </button>
              <button
                onClick={onContinueWithoutSaving}
                disabled={isSavingRating}
                className="font-semibold underline disabled:opacity-50"
              >
                {t('study.ai_mode.continue_without_saving')}
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? t('study.ai_mode.input_thinking') : t('study.ai_mode.input_placeholder')}
            disabled={isLoading || isSavingRating}
            maxLength={MAX_CHAT_INPUT_LENGTH}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-200 disabled:opacity-50"
          />
          <button
            onClick={onSend}
            disabled={isLoading || isSavingRating || !input.trim()}
            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-40"
          >
            {t('study.ai_mode.send')}
          </button>
          <SpeechInputButton
            disabled={isLoading || isSavingRating}
            languageCode={speechLanguageCode}
            onRecordingStart={onRecordingStart}
            onTranscript={onTranscript}
          />
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">{t('study.ai_mode.press_enter')}</p>
      </div>
    </div>
  );
}

function AiAvatar() {
  return (
    <div className="mr-2 mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-black">
      <span className="text-xs text-white">AI</span>
    </div>
  );
}

function ThinkingBubble({ withAvatar = false }: { withAvatar?: boolean }) {
  return (
    <div className="flex justify-start">
      {withAvatar && <AiAvatar />}
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-gray-200 bg-gray-100 px-4 py-3">
        <TypingDots />
      </div>
    </div>
  );
}

'use client';

import { Loader2, Send, Sparkles, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MAX_CHAT_INPUT_LENGTH } from '@/lib/chat';
import { VoiceControls } from '@/components/tts/VoiceControls';
import { SpeechInputButton } from '@/components/stt/SpeechInputButton';
import TypingDots from '@/components/ui/TypingDots';
import type { TtsVoicePreset } from '@/lib/tts';
import type { ChatMessage } from '@/types/chat';
import type { KeyboardEvent, RefObject } from 'react';

interface GeneralChatViewProps {
  autoPlay: boolean;
  input: string;
  inputRef: RefObject<HTMLInputElement | null>;
  isLoading: boolean;
  loadingAudioRequestId: string | null;
  messages: ChatMessage[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onPlayAudio: (text: string, index: number) => void;
  onRecordingStart: () => void;
  onSend: () => void;
  onTranscript: (text: string) => void;
  onToggleAutoPlay: () => void;
  onVoiceChange: (voice: TtsVoicePreset) => void;
  voice: TtsVoicePreset;
  speechLanguageCode: string;
}

export function GeneralChatView({
  autoPlay,
  input,
  inputRef,
  isLoading,
  loadingAudioRequestId,
  messages,
  messagesEndRef,
  onInputChange,
  onPlayAudio,
  onRecordingStart,
  onSend,
  onTranscript,
  onToggleAutoPlay,
  onVoiceChange,
  voice,
  speechLanguageCode,
}: GeneralChatViewProps) {
  const { t } = useTranslation();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;

    event.preventDefault();
    onSend();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center justify-end gap-2 px-4 pb-1 pt-3">
        <VoiceControls
          autoPlay={autoPlay}
          onToggleAutoPlay={onToggleAutoPlay}
          onVoiceChange={onVoiceChange}
          voice={voice}
        />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'ai' && <ChatAvatar />}
            <div className="flex max-w-[75%] flex-col gap-1">
              <div className={`whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'rounded-2xl rounded-tr-sm bg-gray-900 text-white'
                  : 'rounded-2xl rounded-tl-sm border border-gray-200 bg-gray-100 text-gray-800'
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

        {isLoading && (
          <div className="flex justify-start">
            <ChatAvatar />
            <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-gray-100 px-4 py-3">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 border-t border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? t('chat.thinking') : t('chat.placeholder')}
            disabled={isLoading}
            maxLength={MAX_CHAT_INPUT_LENGTH}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-200 disabled:opacity-50"
          />
          <button
            onClick={onSend}
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-40"
            aria-label={t('chat.send', { defaultValue: 'Send' })}
          >
            <Send className="h-4 w-4" />
          </button>
          <SpeechInputButton
            disabled={isLoading}
            languageCode={speechLanguageCode}
            onRecordingStart={onRecordingStart}
            onTranscript={onTranscript}
          />
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">{t('chat.press_enter')}</p>
      </div>
    </div>
  );
}

function ChatAvatar() {
  return (
    <div className="mr-2 mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-black">
      <Sparkles className="h-3.5 w-3.5 text-white" />
    </div>
  );
}

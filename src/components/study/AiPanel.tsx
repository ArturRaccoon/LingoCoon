'use client';

import { useTranslation } from 'react-i18next';
import { SpeechInputButton } from '@/components/stt/SpeechInputButton';
import type { ChatMessage } from '@/types/chat';

interface AiPanelProps {
  input: string;
  loading: boolean;
  messages: ChatMessage[];
  nativeLanguage: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onTranscript: (text: string) => void;
  speechLanguageCode: string;
}

export default function AiPanel({
  input,
  loading,
  messages,
  nativeLanguage,
  onInputChange,
  onSend,
  onTranscript,
  speechLanguageCode,
}: AiPanelProps) {
  const { t } = useTranslation();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;

    event.preventDefault();
    onSend();
  };

  return (
    <div className="flex h-full flex-col border-l border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">{t('study.ai_tutor_label')}</p>
        <p className="text-xs text-gray-500">
          {t('study.responds_in', { language: nativeLanguage })}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="mt-4 text-center text-xs text-gray-500">{t('study.ask_about_card')}</p>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
              message.role === 'user'
                ? 'bg-gray-900 text-white'
                : 'border border-gray-200 bg-white text-gray-800'
            }`}>
              {message.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
              {t('study.thinking')}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-gray-200 px-4 py-3">
        <input
          type="text"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('study.ask_placeholder')}
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
        >
          {t('study.send')}
        </button>
        <SpeechInputButton
          disabled={loading}
          languageCode={speechLanguageCode}
          onTranscript={onTranscript}
        />
      </div>
    </div>
  );
}

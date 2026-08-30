'use client';

import { useTranslation } from 'react-i18next';
import { MAX_CHAT_INPUT_LENGTH } from '@/lib/chat';
import { SpeechInputButton } from '@/components/stt/SpeechInputButton';
import type { ConversationTurn } from '@/types/ai';

interface DeckStudyTutorProps {
  history: ConversationTurn[];
  input: string;
  isLoading: boolean;
  onExplain: () => void;
  onInputChange: (value: string) => void;
  onRecordingStart: () => void;
  onSend: () => void;
  onTranscript: (text: string) => void;
  speechLanguageCode: string;
}

export function DeckStudyTutor({
  history,
  input,
  isLoading,
  onExplain,
  onInputChange,
  onRecordingStart,
  onSend,
  onTranscript,
  speechLanguageCode,
}: DeckStudyTutorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {history.length > 0 && (
        <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
          {history.map((turn, index) => (
            <div key={index} className={turn.role === 'user' ? 'text-right' : 'text-left'}>
              <span className={`inline-block rounded-xl px-3 py-2 text-sm ${
                turn.role === 'user'
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-200 bg-white text-gray-700'
              }`}>
                {turn.parts[0].text}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="text-left">
              <span className="inline-block rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400">
                {t('study_session.ai_thinking')}
              </span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onExplain}
        disabled={isLoading}
        className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
      >
        {t('study_session.explain_word')}
      </button>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && onSend()}
          placeholder={t('study_session.ask_placeholder')}
          disabled={isLoading}
          maxLength={MAX_CHAT_INPUT_LENGTH}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
        >
          {t('study.ai_mode.send')}
        </button>
        <SpeechInputButton
          disabled={isLoading}
          languageCode={speechLanguageCode}
          onRecordingStart={onRecordingStart}
          onTranscript={onTranscript}
        />
      </div>
    </div>
  );
}

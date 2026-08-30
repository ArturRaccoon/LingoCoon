'use client';

import { Loader2, Mic, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSpeechToText } from '@/hooks/useSpeechToText';

interface SpeechInputButtonProps {
  disabled?: boolean;
  languageCode: string;
  onRecordingStart?: () => void;
  onTranscript: (text: string) => void;
}

export function SpeechInputButton({
  disabled = false,
  languageCode,
  onRecordingStart,
  onTranscript,
}: SpeechInputButtonProps) {
  const { t } = useTranslation();
  const {
    error,
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
  } = useSpeechToText({ languageCode, onRecordingStart, onTranscript });

  const label = isRecording
    ? t('stt.stop_recording')
    : isTranscribing
      ? t('stt.transcribing')
      : t('stt.start_recording');

  return (
    <div className="relative flex-shrink-0">
      {isTranscribing && (
        <p className="absolute bottom-full right-0 z-20 mb-2 w-64 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-800 shadow-sm">
          {t('stt.transcribing_hint')}
        </p>
      )}
      {error && (
        <p className="absolute bottom-full right-0 z-20 mb-2 w-64 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 shadow-sm">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={isRecording ? stopRecording : () => void startRecording()}
        disabled={disabled || isTranscribing}
        aria-label={label}
        title={label}
        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          isRecording
            ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        {isRecording
          ? <Square className="h-4 w-4 fill-current" />
          : isTranscribing
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Mic className="h-4 w-4" />
        }
      </button>
    </div>
  );
}

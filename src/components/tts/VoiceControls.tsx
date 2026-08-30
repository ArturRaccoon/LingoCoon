'use client';

import { UserRound, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TtsVoicePreset } from '@/lib/tts';

interface VoiceControlsProps {
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
  onVoiceChange: (voice: TtsVoicePreset) => void;
  voice: TtsVoicePreset;
}

const VOICE_PRESETS: Array<{ labelKey: string; value: TtsVoicePreset }> = [
  { labelKey: 'tts.voices.female', value: 'female' },
  { labelKey: 'tts.voices.male', value: 'male' },
];

export function VoiceControls({
  autoPlay,
  onToggleAutoPlay,
  onVoiceChange,
  voice,
}: VoiceControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">{t('tts.voice')}</span>
      <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
        {VOICE_PRESETS.map((preset) => {
          const isSelected = voice === preset.value;
          const label = t(preset.labelKey);

          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => onVoiceChange(preset.value)}
              title={label}
              aria-label={label}
              aria-pressed={isSelected}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                isSelected
                  ? 'bg-gray-200 font-semibold text-gray-800'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <UserRound className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onToggleAutoPlay}
        title={t(autoPlay ? 'tts.disable_auto_play' : 'tts.enable_auto_play')}
        aria-label={t(autoPlay ? 'tts.disable_auto_play' : 'tts.enable_auto_play')}
        aria-pressed={autoPlay}
        className={`rounded-full p-2 transition-colors ${
          autoPlay
            ? 'bg-gray-50 text-gray-900 hover:bg-gray-200'
            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
      >
        {autoPlay ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>
    </div>
  );
}

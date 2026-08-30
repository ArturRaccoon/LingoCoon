export const TTS_VOICE_PRESETS = ['female', 'male'] as const;

export type TtsVoicePreset = (typeof TTS_VOICE_PRESETS)[number];

export function isTtsVoicePreset(value: unknown): value is TtsVoicePreset {
  return TTS_VOICE_PRESETS.includes(value as TtsVoicePreset);
}

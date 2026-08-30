import { getRequiredEnvironmentVariable } from '@/lib/server/environment';
import type { TtsVoicePreset } from '@/lib/tts';

const DEFAULT_FREE_FEMALE_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
const DEFAULT_FREE_MALE_VOICE_ID = 'pNInz6obpgDQGcFmaJgB';
const DEFAULT_MODEL_ID = 'eleven_flash_v2_5';

export function getElevenLabsConfig(voicePreset: TtsVoicePreset) {
  const voiceIds: Record<TtsVoicePreset, string> = {
    female: getOptionalEnvironmentVariable('ELEVENLABS_VOICE_ID_FEMALE')
      ?? DEFAULT_FREE_FEMALE_VOICE_ID,
    male: getOptionalEnvironmentVariable('ELEVENLABS_VOICE_ID_MALE')
      ?? DEFAULT_FREE_MALE_VOICE_ID,
  };

  return {
    apiKey: getRequiredEnvironmentVariable('ELEVENLABS_API_KEY'),
    modelId: process.env.ELEVENLABS_MODEL_ID ?? DEFAULT_MODEL_ID,
    voiceId: voiceIds[voicePreset],
  };
}

function getOptionalEnvironmentVariable(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

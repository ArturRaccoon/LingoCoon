/**
 * Speech-to-Text (STT) configuration.
 *
 * The microphone feature works only when STT_API_KEY is configured.
 * The endpoint and model are configurable for any Whisper-compatible STT service.
 * No provider-specific defaults — the user must explicitly configure the endpoint.
 */

const DEFAULT_STT_MODEL_ID = 'whisper-1';

export function getSpeechToTextConfig() {
  return {
    apiKey: process.env.STT_API_KEY ?? '',
    endpoint: process.env.STT_ENDPOINT ?? '',
    modelId: process.env.STT_MODEL_ID ?? DEFAULT_STT_MODEL_ID,
  };
}

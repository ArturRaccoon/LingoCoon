import { NextRequest, NextResponse } from 'next/server';
import { getElevenLabsConfig } from '@/lib/server/tts-config';
import { isTtsVoicePreset } from '@/lib/tts';
import type { TtsVoicePreset } from '@/lib/tts';
import {
  AuthenticationRequiredError,
  requireAuthenticatedClaims,
} from '@/lib/supabase/auth';
import { normalizeLanguageCode } from '@/lib/languages';
import { prepareTtsText } from '@/lib/tts-utils';

const ELEVENLABS_TTS_ENDPOINT = 'https://api.elevenlabs.io/v1/text-to-speech';
const MAX_TEXT_LENGTH = 5000;

interface TTSRequest {
  text: string;
  /** Omit for mixed-language text so ElevenLabs can detect each language naturally. */
  languageCode?: string;
  speed?: number;
  voice: TtsVoicePreset;
}

class InvalidTtsRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTtsRequestError';
  }
}

function parseTtsRequest(value: unknown): TTSRequest {
  if (!value || typeof value !== 'object') {
    throw new InvalidTtsRequestError('Request body must be a JSON object.');
  }

  const body = value as Record<string, unknown>;
  if (typeof body.text !== 'string') {
    throw new InvalidTtsRequestError('Missing required field: text');
  }

  const languageCode = body.languageCode;
  if (languageCode !== undefined && typeof languageCode !== 'string') {
    throw new InvalidTtsRequestError('languageCode must be a string.');
  }

  const speed = body.speed;
  if (
    speed !== undefined &&
    (typeof speed !== 'number' ||
      !Number.isFinite(speed) ||
      speed < 0.7 ||
      speed > 1.2)
  ) {
    throw new InvalidTtsRequestError('speed must be between 0.7 and 1.2.');
  }

  const voice = body.voice ?? 'female';
  if (!isTtsVoicePreset(voice)) {
    throw new InvalidTtsRequestError('voice must be female or male.');
  }

  return {
    text: body.text,
    languageCode,
    speed,
    voice,
  };
}

export async function POST(request: NextRequest) {
  try {
    await requireAuthenticatedClaims();

    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      throw new InvalidTtsRequestError('Request body must be valid JSON.');
    }

    const body = parseTtsRequest(requestBody);
    const text = prepareTtsText(body.text);

    if (!text) {
      return NextResponse.json({ error: 'Missing required field: text' }, { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text too long (max ${MAX_TEXT_LENGTH} characters)` },
        { status: 400 },
      );
    }

    const { apiKey, modelId, voiceId } = getElevenLabsConfig(body.voice);
    const languageCode = body.languageCode ? normalizeLanguageCode(body.languageCode) : undefined;

    const response = await fetch(
      `${ELEVENLABS_TTS_ENDPOINT}/${encodeURIComponent(voiceId)}/stream?output_format=mp3_22050_32`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          ...(languageCode ? { language_code: languageCode } : {}),
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.75,
            style: 0.35,
            use_speaker_boost: true,
            speed: body.speed ?? 1,
          },
        }),
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error('ElevenLabs TTS API error:', response.status, detail);
      return NextResponse.json(
        { error: getElevenLabsErrorMessage(response.status) },
        { status: response.status === 429 ? 429 : 502 },
      );
    }

    return new NextResponse(response.body, {
      headers: {
        'Cache-Control': 'private, max-age=3600',
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof InvalidTtsRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('TTS API route error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

function getElevenLabsErrorMessage(status: number): string {
  if (status === 401) return 'The ElevenLabs API key is invalid.';
  if (status === 404) return 'The selected ElevenLabs voice is not available.';
  if (status === 429) return 'TTS usage limit reached.';

  return 'TTS generation failed.';
}

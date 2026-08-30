import { NextRequest, NextResponse } from 'next/server';
import { normalizeLanguageCode } from '@/lib/languages';
import { getSpeechToTextConfig } from '@/lib/server/stt-config';
import {
  AuthenticationRequiredError,
  requireAuthenticatedClaims,
} from '@/lib/supabase/auth';

const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
const MAX_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const recentRequestsByUser = new Map<string, number[]>();

class InvalidSttRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSttRequestError';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { claims } = await requireAuthenticatedClaims();
    enforceRateLimit(claims.sub);

    const formData = await request.formData();
    const audio = formData.get('audio');
    const language = formData.get('language');

    if (!(audio instanceof File) || !audio.type.startsWith('audio/')) {
      throw new InvalidSttRequestError('A valid audio file is required.');
    }
    if (audio.size === 0 || audio.size > MAX_AUDIO_BYTES) {
      throw new InvalidSttRequestError('The audio recording is too large.');
    }
    if (typeof language !== 'string' || !language.trim()) {
      throw new InvalidSttRequestError('A language is required.');
    }

    const config = getSpeechToTextConfig();
    const transcriptionFormData = new FormData();
    transcriptionFormData.set('file', audio, getAudioFileName(audio.type));
    transcriptionFormData.set('model', config.modelId);
    transcriptionFormData.set('language', normalizeLanguageCode(language));
    transcriptionFormData.set('response_format', 'json');
    transcriptionFormData.set('temperature', '0');

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiKey}` },
      body: transcriptionFormData,
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('STT API error:', response.status, detail);

      return NextResponse.json(
        { error: getSttErrorMessage(response.status) },
        { status: response.status === 429 ? 429 : 502 },
      );
    }

    const result = await response.json() as { text?: unknown };
    if (typeof result.text !== 'string' || !result.text.trim()) {
      return NextResponse.json({ error: 'No speech was recognized.' }, { status: 422 });
    }

    return NextResponse.json({ text: result.text.trim() });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof InvalidSttRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('STT API route error:', error);
    return NextResponse.json({ error: 'Speech recognition failed.' }, { status: 500 });
  }
}

function enforceRateLimit(userId: string) {
  const now = Date.now();
  const recentRequests = (recentRequestsByUser.get(userId) ?? [])
    .filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    throw new InvalidSttRequestError('Too many recordings. Wait a moment and try again.');
  }

  recentRequests.push(now);
  recentRequestsByUser.set(userId, recentRequests);
}

function getAudioFileName(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'recording.m4a';
  if (mimeType.includes('ogg')) return 'recording.ogg';

  return 'recording.webm';
}

function getSttErrorMessage(status: number): string {
  if (status === 401 || status === 403) return 'Speech recognition is not configured correctly.';
  if (status === 429) return 'Speech recognition usage limit reached. Try again later.';

  return 'Speech recognition failed.';
}

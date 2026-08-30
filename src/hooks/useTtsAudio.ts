'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TtsVoicePreset } from '@/lib/tts';

interface PlayTtsAudioOptions {
  text: string;
  languageCode?: string;
  speed?: number;
  voice?: TtsVoicePreset;
}

interface TtsErrorResponse {
  error?: string;
}

function getCacheKey(options: PlayTtsAudioOptions, text: string): string {
  return [
    options.voice ?? 'female',
    options.languageCode ?? 'auto',
    options.speed ?? 1,
    text,
  ].join(':');
}

export function useTtsAudio() {
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);
  const audioCache = useRef(new Map<string, string>());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const loadingRequestIdRef = useRef<string | null>(null);
  const playbackVersionRef = useRef(0);

  useEffect(() => () => {
    currentAudioRef.current?.pause();
    audioCache.current.forEach((audioSource) => URL.revokeObjectURL(audioSource));
    audioCache.current.clear();
  }, []);

  const stopAudio = useCallback(() => {
    playbackVersionRef.current += 1;
    currentAudioRef.current?.pause();
    currentAudioRef.current = null;
  }, []);

  const playAudio = useCallback(async (
    options: PlayTtsAudioOptions,
    requestId = 'audio',
  ) => {
    const text = options.text.trim();
    if (!text || loadingRequestIdRef.current) return;

    const cacheKey = getCacheKey(options, text);
    stopAudio();
    const playbackVersion = playbackVersionRef.current;
    loadingRequestIdRef.current = requestId;
    setLoadingRequestId(requestId);

    try {
      let audioSource = audioCache.current.get(cacheKey);

      if (!audioSource) {
        const response = await fetch('/api/tts/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...options, text }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null) as TtsErrorResponse | null;
          throw new Error(data?.error ?? `TTS request failed: ${response.status}`);
        }

        audioSource = URL.createObjectURL(await response.blob());
        audioCache.current.set(cacheKey, audioSource);
      }

      if (playbackVersion !== playbackVersionRef.current) return;

      const audio = new Audio(audioSource);
      currentAudioRef.current = audio;
      await audio.play();
    } catch (error) {
      console.error('[TTS] Audio playback failed:', error);
    } finally {
      loadingRequestIdRef.current = null;
      setLoadingRequestId(null);
    }
  }, [stopAudio]);

  return {
    isAudioLoading: loadingRequestId !== null,
    loadingRequestId,
    playAudio,
    stopAudio,
  };
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const MAX_RECORDING_DURATION_MS = 20_000;

type SpeechToTextStatus = 'idle' | 'recording' | 'transcribing';

interface UseSpeechToTextOptions {
  languageCode: string;
  onTranscript: (text: string) => void;
  onRecordingStart?: () => void;
}

interface SttResponse {
  error?: string;
  text?: string;
}

export function useSpeechToText({
  languageCode,
  onTranscript,
  onRecordingStart,
}: UseSpeechToTextOptions) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<SpeechToTextStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const isUnmountingRef = useRef(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (recordingTimerRef.current !== null) {
      window.clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const transcribe = useCallback(async (audio: Blob) => {
    setStatus('transcribing');

    try {
      const formData = new FormData();
      formData.set('audio', audio, 'recording.webm');
      formData.set('language', languageCode);

      const response = await fetch('/api/stt/transcribe', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json().catch(() => null) as SttResponse | null;

      if (!response.ok || typeof result?.text !== 'string') {
        throw new Error(result?.error ?? 'Speech recognition failed.');
      }

      onTranscript(result.text);
    } catch (transcriptionError) {
      console.error('[STT] Transcription failed:', transcriptionError);
      setError(t('stt.errors.transcription_failed'));
    } finally {
      setStatus('idle');
    }
  }, [languageCode, onTranscript, t]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    recorder.stop();
  }, []);

  const startRecording = useCallback(async () => {
    if (status !== 'idle') return;

    setError(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError(t('stt.errors.unsupported'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      const recorder = new MediaRecorder(stream, getMediaRecorderOptions());

      chunksRef.current = [];
      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType });

        mediaRecorderRef.current = null;
        chunksRef.current = [];
        stopStream();

        if (!isUnmountingRef.current && audio.size > 0) void transcribe(audio);
      };

      onRecordingStart?.();
      recorder.start();
      setStatus('recording');
      recordingTimerRef.current = window.setTimeout(stopRecording, MAX_RECORDING_DURATION_MS);
    } catch (recordingError) {
      console.error('[STT] Microphone access failed:', recordingError);
      stopStream();
      setError(t('stt.errors.microphone_denied'));
    }
  }, [onRecordingStart, status, stopRecording, stopStream, t, transcribe]);

  useEffect(() => {
    isUnmountingRef.current = false;

    return () => {
      isUnmountingRef.current = true;
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      stopStream();
    };
  }, [stopStream]);

  return {
    error,
    isRecording: status === 'recording',
    isTranscribing: status === 'transcribing',
    startRecording,
    stopRecording,
  };
}

function getMediaRecorderOptions(): MediaRecorderOptions | undefined {
  const preferredMimeTypes = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'];
  const mimeType = preferredMimeTypes.find((type) => MediaRecorder.isTypeSupported(type));

  return mimeType ? { mimeType } : undefined;
}

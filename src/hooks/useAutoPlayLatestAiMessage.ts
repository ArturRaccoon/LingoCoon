import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/chat';

interface UseAutoPlayLatestAiMessageOptions {
  autoPlay: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  onPlayAudio: (text: string, messageIndex: number) => void;
}

export function useAutoPlayLatestAiMessage({
  autoPlay,
  isLoading,
  messages,
  onPlayAudio,
}: UseAutoPlayLatestAiMessageOptions) {
  const previousLoadingRef = useRef(false);

  useEffect(() => {
    const replyJustFinished = previousLoadingRef.current && !isLoading;
    previousLoadingRef.current = isLoading;

    if (!replyJustFinished || !autoPlay) return;

    const lastIndex = messages.length - 1;
    const lastMessage = messages[lastIndex];
    if (!lastMessage || lastMessage.role !== 'ai') return;

    const timerId = window.setTimeout(() => {
      onPlayAudio(lastMessage.text, lastIndex);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [autoPlay, isLoading, messages, onPlayAudio]);
}

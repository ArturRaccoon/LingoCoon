export function appendTranscript(currentInput: string, transcript: string): string {
  return [currentInput.trim(), transcript.trim()].filter(Boolean).join(' ');
}

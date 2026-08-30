import {
  buildAlwaysUseNativeLanguageRule,
  getPromptLanguageName,
} from '@/lib/prompt-languages';
import type { Card } from '@/lib/supabase/types';
import type { SessionCard } from '@/types/study';

function describeClassicStudyCard(card: SessionCard): string {
  return `Current card:
- Front: ${card.front}
- Back: ${card.back}
- Example sentence: ${card.exampleSentence ?? 'none'}
- Pronunciation: ${card.pronunciation ?? 'none'}
- Times studied: ${card.repetitions ?? 0}
- Current interval: ${card.interval ?? 0} days`;
}

function describeDeckStudyCard(card: Card | undefined): string {
  return `Current card - Front: "${card?.front ?? ''}", Back: "${card?.back ?? ''}".`;
}

export function buildClassicStudyTutorPrompt(
  card: SessionCard,
  nativeLanguage: string,
): string {
  const nativeLanguageName = getPromptLanguageName(nativeLanguage);

  return `You are a language tutor helping a student study flashcards.

${describeClassicStudyCard(card)}

The student may ask anything about this card: meaning, grammar, usage, memory tips.
Keep answers concise. Never reveal you are an AI model unless directly asked.
IMPORTANT: ${buildAlwaysUseNativeLanguageRule(nativeLanguageName)}`;
}

export function buildDeckStudyTutorPrompt(
  card: Card | undefined,
  studyingLanguage: string,
  nativeLanguage: string,
): string {
  const studyingLanguageName = getPromptLanguageName(studyingLanguage);
  const nativeLanguageName = getPromptLanguageName(nativeLanguage);

  return `You are a concise language tutor.
The student is learning ${studyingLanguageName}. Their native language is ${nativeLanguageName}.
${buildAlwaysUseNativeLanguageRule(nativeLanguageName)}
Keep answers under 4 sentences. Focus on practical usage, not theory.
${describeDeckStudyCard(card)}`;
}

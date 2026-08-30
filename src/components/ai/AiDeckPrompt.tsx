'use client';

import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  buildAiDeckSuggestions,
  getStudentPromptValues,
} from '@/components/ai/ai-deck-suggestions';

export const MAX_AI_DECK_PROMPT_LENGTH = 1000;

interface AiDeckPromptProps {
  currentLevel: string | null;
  learningPurpose: string | null;
  learningPurposeDetails: string | null;
  prompt: string;
  nativeLanguage: string | null;
  targetLanguage: string | null;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
}

export function AiDeckPrompt({
  currentLevel,
  learningPurpose,
  learningPurposeDetails,
  prompt,
  nativeLanguage,
  targetLanguage,
  onPromptChange,
  onGenerate,
}: AiDeckPromptProps) {
  const { t } = useTranslation();
  const promptValues = getStudentPromptValues(t, {
    currentLevel,
    learningPurpose,
    learningPurposeDetails,
    nativeLanguage,
    targetLanguage,
  });
  const suggestions = buildAiDeckSuggestions(t, {
    currentLevel,
    learningPurpose,
    learningPurposeDetails,
    nativeLanguage,
    targetLanguage,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ai_deck.page_title')}</h1>
        </div>
        <p className="text-sm text-gray-500 ml-11">{t('ai_deck.page_subtitle')}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('ai_deck.prompt_label')}
        </label>
        <textarea
          value={prompt}
          onChange={(event) =>
            onPromptChange(event.target.value.slice(0, MAX_AI_DECK_PROMPT_LENGTH))
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              onGenerate();
            }
          }}
          placeholder={t('ai_deck.prompt_placeholder', promptValues)}
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-200 resize-none bg-white"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">{t('ai_deck.shortcut_hint')}</p>
          <p className="text-xs text-gray-400">
            {prompt.length}/{MAX_AI_DECK_PROMPT_LENGTH}
          </p>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!prompt.trim()}
        className="w-full bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
      >
        <Sparkles className="w-4 h-4" />
        {t('ai_deck.generate_button')}
      </button>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {t('ai_deck.examples_label')}
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onPromptChange(suggestion)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all leading-relaxed"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

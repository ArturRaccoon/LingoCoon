'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AiDeckGeneratingState() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black">
        <Sparkles className="h-7 w-7 animate-pulse text-white" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-800">{t('ai_deck.generating_title')}</p>
        <p className="mt-1 max-w-xs text-sm text-gray-400">
          {t('ai_deck.generating_subtitle')}
        </p>
      </div>
      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
    </div>
  );
}

export function AiDeckErrorState({
  message,
  onBack,
}: {
  message: string | null;
  onBack: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <div className="text-center">
        <p className="text-sm font-medium text-red-500">{message}</p>
        <p className="mt-1 text-xs text-gray-400">{t('ai_deck.error_console')}</p>
      </div>
      <button
        onClick={onBack}
        className="text-sm text-gray-600 underline underline-offset-4 transition-colors hover:text-gray-900"
      >
        {t('ai_deck.error_back')}
      </button>
    </div>
  );
}

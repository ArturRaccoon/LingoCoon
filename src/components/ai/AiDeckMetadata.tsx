'use client';

import { useTranslation } from 'react-i18next';
import { APP_LANGUAGES } from '@/lib/languages';
import type { GeneratedDeck } from '@/types/ai-deck';

interface AiDeckMetadataProps {
  deck: GeneratedDeck;
  disabled: boolean;
  onTitleChange: (title: string) => void;
  onLanguageChange: (field: 'language_from' | 'language_to', value: string) => void;
}

export function AiDeckMetadata({
  deck,
  disabled,
  onTitleChange,
  onLanguageChange,
}: AiDeckMetadataProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-500">
          {t('ai_deck.deck_title_label')}
        </label>
        <input
          type="text"
          value={deck.title}
          onChange={(event) => onTitleChange(event.target.value)}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-200 disabled:opacity-50"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <LanguageSelect
          label={t('ai_deck.front_language_label')}
          value={deck.language_from}
          excludeValue={deck.language_to}
          disabled={disabled}
          onChange={(value) => onLanguageChange('language_from', value)}
        />
        <LanguageSelect
          label={t('ai_deck.back_language_label')}
          value={deck.language_to}
          excludeValue={deck.language_from}
          disabled={disabled}
          onChange={(value) => onLanguageChange('language_to', value)}
        />
      </div>
    </div>
  );
}

function LanguageSelect({
  label,
  value,
  excludeValue,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  excludeValue: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-500">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none disabled:opacity-50"
      >
        {APP_LANGUAGES.filter((language) => language.code !== excludeValue).map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}

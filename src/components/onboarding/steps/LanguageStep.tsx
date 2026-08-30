'use client';

import { cn } from '@/lib/utils';
import { APP_LANGUAGES } from '@/lib/languages';
import { getTranslatedLanguageName } from '@/lib/translated-language';
import { useTranslation } from 'react-i18next';

interface LanguageStepProps {
  title: string;
  subtitle: string;
  value: string;
  onChange: (code: string) => void;
  type: 'native' | 'target';
  excludeLanguage?: string;
}
export function LanguageStep({
  title,
  subtitle,
  value,
  onChange,
  type,
  excludeLanguage,
}: LanguageStepProps) {
  const { t } = useTranslation();
  const availableLanguages = excludeLanguage
    ? APP_LANGUAGES.filter((lang) => lang.code !== excludeLanguage)
    : APP_LANGUAGES;

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        role="radiogroup"
        aria-label={
          type === 'native'
            ? t('onboarding.step1.native_language')
            : t('onboarding.step1.target_language')
        }
      >
        {availableLanguages.map((language) => {
          const isSelected = value === language.code;

          return (
            <button
              key={language.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(language.code)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                'hover:border-primary/50 hover:bg-muted/50',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card'
              )}
            >
              <span
                className={cn(
                  'font-medium text-sm',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}
              >
                {getTranslatedLanguageName(t, language.code)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

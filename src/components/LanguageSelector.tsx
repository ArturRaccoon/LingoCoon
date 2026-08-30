'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  APP_LANGUAGES,
  normalizeLanguageCode,
} from '@/lib/languages';
import { getTranslatedLanguageName } from '@/lib/translated-language';

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLanguage = normalizeLanguageCode(i18n.resolvedLanguage ?? i18n.language ?? 'en');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectLanguage(language: string) {
    void i18n.changeLanguage(language);
    setIsOpen(false);
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label="Select language"
        className="flex items-center gap-2 rounded-lg border border-gray-900 bg-white px-4 py-2.5 transition-colors duration-200 hover:bg-gray-100"
      >
        <span className="text-sm font-medium text-gray-900">
          {getTranslatedLanguageName(t, currentLanguage)}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-900 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-[9999] mt-2 min-w-[180px] rounded-lg border border-gray-900 bg-white p-2 shadow-lg">
          {APP_LANGUAGES.map((language) => {
            const selected = language.code === currentLanguage;

            return (
              <button
                key={language.code}
                onClick={() => selectLanguage(language.code)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-150 ${
                  selected ? 'bg-black text-white' : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                {getTranslatedLanguageName(t, language.code)}
                {selected && <Check className="ml-auto h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

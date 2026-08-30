'use client';

import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LexicoonEmptyState() {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 px-6 py-14 text-center">
      <BookOpen className="mx-auto mb-3 h-8 w-8 text-gray-300" />
      <p className="font-semibold text-gray-700">{t('lexicoon.empty_title')}</p>
      <p className="mt-1 text-sm text-gray-400">{t('lexicoon.empty_description')}</p>
    </div>
  );
}

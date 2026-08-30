'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex shrink-0 justify-end border-b border-gray-200 p-4 sm:p-6">
        <LanguageSelector />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-lg bg-black">
          <span className="text-5xl font-bold text-white">L</span>
        </div>
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-black sm:text-7xl">
          LingoCoon
        </h1>
        <p className="mb-8 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
          {t('landing.hero_subtitle')}
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-3 rounded-lg bg-black px-10 py-5 text-lg font-semibold text-white transition-colors duration-200 hover:bg-gray-800"
        >
          {t('landing.cta_start')}
          <ArrowRight className="h-5 w-5" />
        </Link>
        <p className="mt-6 text-gray-500">
          {t('publicOnboarding.hasAccount')}{' '}
          <Link
            href="/login"
            className="font-medium text-black underline underline-offset-4 transition-colors hover:text-gray-700"
          >
            {t('publicOnboarding.signIn')}
          </Link>
        </p>
      </main>
      <footer className="shrink-0 border-t border-gray-200 py-4 text-center text-sm text-gray-400">
        <span>&copy; 2026 LingoCoon </span>
        <Link href="/privacy" className="underline hover:text-black">
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
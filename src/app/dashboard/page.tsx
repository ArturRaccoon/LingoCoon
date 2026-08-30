'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, BookOpen, Bot, Library, MessageSquare, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppShell from '@/components/layout/AppShell';

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <header className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('home.welcome')}</h1>
          <p className="text-sm text-gray-500">{t('decks.subtitle')}</p>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DashboardCard
            href="/decks"
            icon={<Library className="h-5 w-5 text-white" />}
            iconClassName="bg-gray-900"
            title={t('decks.title')}
            description={t('home.decks_desc')}
            action={t('home.open')}
          />
          <DashboardCard
            href="/decks"
            icon={<Plus className="h-5 w-5 text-gray-700" />}
            iconClassName="bg-gray-200"
            title={t('decks.create_new')}
            description={t('home.create_desc')}
            action={t('home.create')}
            dashed
          />
        </div>

        <Link
          href="/ai"
          className="group flex items-center justify-between rounded-2xl border border-gray-300 bg-gray-50 p-6 transition-all duration-200 hover:border-gray-500 hover:shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-black">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">AI</span>
              <h2 className="mb-1 text-base font-bold text-gray-900">{t('ai_page.title')}</h2>
              <p className="text-sm leading-relaxed text-gray-500">{t('home.ai_desc')}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <FeaturePill
                  icon={<MessageSquare className="h-3 w-3" />}
                  label={t('ai_page.free_chat')}
                  className="bg-gray-200 text-gray-800"
                />
                <FeaturePill
                  icon={<BookOpen className="h-3 w-3" />}
                  label={t('ai_page.study_with_decks')}
                  className="bg-gray-200 text-gray-800"
                />
              </div>
            </div>
          </div>
          <ArrowRight className="ml-4 h-5 w-5 flex-shrink-0 text-gray-500 transition-all group-hover:translate-x-1 group-hover:text-gray-900" />
        </Link>
      </div>
    </AppShell>
  );
}

function DashboardCard({
  href,
  icon,
  iconClassName,
  title,
  description,
  action,
  dashed = false,
}: {
  href: string;
  icon: ReactNode;
  iconClassName: string;
  title: string;
  description: string;
  action: string;
  dashed?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col justify-between rounded-2xl border bg-white p-6 transition-all duration-200 hover:shadow-md ${
        dashed
          ? 'border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-white'
          : 'border-gray-200 hover:border-gray-900'
      }`}
    >
      <div>
        <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}>
          {icon}
        </div>
        <h2 className="mb-1 text-base font-bold text-gray-900">{title}</h2>
        <p className="text-sm leading-relaxed text-gray-500">{description}</p>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-900 transition-all group-hover:gap-2">
        {action}
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

function FeaturePill({
  icon,
  label,
  className,
}: {
  icon: ReactNode;
  label: string;
  className: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs ${className}`}>
      {icon}
      {label}
    </span>
  );
}

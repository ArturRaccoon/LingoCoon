'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { BookOpen, Bot, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GeneralChat from '@/components/ai/GeneralChat';
import { AiStudyDeckList } from '@/components/ai/AiStudyDeckList';
import AppShell from '@/components/layout/AppShell';
import type { DeckWithCardCount } from '@/lib/supabase/types';

type AiPageTab = 'chat' | 'decks';

interface AiPageClientProps {
  decks: DeckWithCardCount[];
  userEmail?: string;
  nativeLanguage: string | null;
  targetLanguage: string | null;
}

export default function AiPageClient({
  decks,
  userEmail,
  nativeLanguage,
  targetLanguage,
}: AiPageClientProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AiPageTab>('chat');

  return (
    <AppShell userEmail={userEmail}>
      <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col md:h-[calc(100vh-2rem)]">
        <header className="flex-shrink-0 px-4 pb-4 pt-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold leading-tight text-gray-900">
              {t('ai_page.title')}
            </h1>
          </div>

          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            <TabButton
              active={activeTab === 'chat'}
              icon={<MessageSquare className="h-4 w-4" />}
              label={t('ai_page.tab_chat')}
              onClick={() => setActiveTab('chat')}
            />
            <TabButton
              active={activeTab === 'decks'}
              icon={<BookOpen className="h-4 w-4" />}
              label={t('ai_page.tab_decks')}
              onClick={() => setActiveTab('decks')}
            />
          </div>
        </header>

        <div className="mx-4 mb-4 flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {activeTab === 'chat' ? (
            <GeneralChat
              nativeLanguage={nativeLanguage}
              targetLanguage={targetLanguage}
            />
          ) : (
            <AiStudyDeckList decks={decks} />
          )}
        </div>
      </div>
    </AppShell>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

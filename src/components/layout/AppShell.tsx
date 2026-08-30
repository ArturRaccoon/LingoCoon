'use client';

import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Bot, Home, Library, LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { signOut } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  icon: ComponentType<{ className?: string }>;
  labelKey: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: Home, labelKey: 'navigation.dashboard' },
  { href: '/ai', icon: Bot, labelKey: 'navigation.ai' },
  { href: '/decks', icon: Library, labelKey: 'navigation.flashcards' },
  { href: '/lexicoon', icon: BookOpen, labelKey: 'navigation.lexicoon' },
  { href: '/settings', icon: Settings, labelKey: 'navigation.settings' },
];

interface AppShellProps {
  children: ReactNode;
  userEmail?: string;
}

export default function AppShell({ children, userEmail }: AppShellProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <DesktopSidebar userEmail={userEmail} />
      <MobileHeader />
      <MobileNavigation />
      <main className="min-h-screen pb-20 pt-14 md:ml-60 md:pb-0 md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}

function DesktopSidebar({ userEmail }: { userEmail?: string }) {
  const { t } = useTranslation();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-black/10 bg-white dark:border-white/10 dark:bg-black md:flex">
      <div className="flex h-16 items-center border-b border-black/10 px-6 dark:border-white/10">
        <BrandLink />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <DesktopNavLink key={item.href} item={item} />
        ))}
      </nav>
      <div className="border-t border-black/10 p-4 dark:border-white/10">
        {userEmail && (
          <p className="mb-3 truncate text-xs text-black/50 dark:text-white/50">{userEmail}</p>
        )}
        <form>
          <Button
            formAction={signOut}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-black/70 hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            {t('common.logout')}
          </Button>
        </form>
      </div>
    </aside>
  );
}

function DesktopNavLink({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const active = useIsActiveRoute(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-black text-white dark:bg-white dark:text-black'
          : 'text-black/70 hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white',
      )}
    >
      <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
      {t(item.labelKey)}
    </Link>
  );
}

function MobileHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center border-b border-black/10 bg-white px-4 dark:border-white/10 dark:bg-black md:hidden">
      <BrandLink compact />
    </header>
  );
}

function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-black/10 bg-white dark:border-white/10 dark:bg-black md:hidden">
      {NAV_ITEMS.map((item) => (
        <MobileNavLink key={item.href} item={item} />
      ))}
    </nav>
  );
}

function MobileNavLink({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const active = useIsActiveRoute(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex flex-col items-center gap-1 px-4 py-2 transition-all duration-200',
        active ? 'text-black dark:text-white' : 'text-black/50 dark:text-white/50',
      )}
    >
      <div className={cn('rounded-lg p-1.5', active && 'bg-black dark:bg-white')}>
        <Icon className={cn('h-5 w-5', active && 'text-white dark:text-black')} />
      </div>
      <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
    </Link>
  );
}

function BrandLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-black dark:bg-white',
          compact ? 'h-7 w-7' : 'h-8 w-8',
        )}
      >
        <span className={cn('font-bold text-white dark:text-black', compact ? 'text-xs' : 'text-sm')}>
          LC
        </span>
      </div>
      <span className={cn('font-bold tracking-tight text-black dark:text-white', compact ? 'text-base' : 'text-lg')}>
        LingoCoon
      </span>
    </Link>
  );
}

function useIsActiveRoute(href: string) {
  const pathname = usePathname();
  return href === '/dashboard' ? pathname === href : pathname.startsWith(href);
}

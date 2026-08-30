import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import I18nProvider from '@/components/providers/I18nProvider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import CookieBanner from '@/components/CookieBanner';

export const metadata: Metadata = {
  title: 'LingoCoon - Learn Languages',
  description: 'Your personal language learning companion. Smart, adaptive, and designed for real results.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <I18nProvider>
          {children}
          <Toaster />
          <CookieBanner />
        </I18nProvider>
      </body>
    </html>
  );
}
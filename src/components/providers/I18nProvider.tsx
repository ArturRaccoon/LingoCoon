'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useSyncExternalStore } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';

function subscribeToInitialization(handleStoreChange: () => void) {
  i18n.on('initialized', handleStoreChange);

  return () => {
    i18n.off('initialized', handleStoreChange);
  };
}

function getInitializationStatus() {
  return i18n.isInitialized;
}

function getServerInitializationStatus() {
  return false;
}

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const isReady = useSyncExternalStore(
    subscribeToInitialization,
    getInitializationStatus,
    getServerInitializationStatus,
  );

  if (!isReady) {
    return <LoadingScreen />;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

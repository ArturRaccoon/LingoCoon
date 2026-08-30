'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisibile] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookies_accepted');
    if (!accepted) {
      const timer = requestAnimationFrame(() => setVisibile(true));
      return () => cancelAnimationFrame(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem('cookies_accepted', 'true');
    setVisibile(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-6">
        <p className="text-sm text-gray-600">
          LingoCoon uses essential cookies to keep you logged in.
          {' '}
          <Link href="/privacy" className="text-black underline">
            Learn more
          </Link>
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Accept
        </button>
      </div>
    </div>
  )
}
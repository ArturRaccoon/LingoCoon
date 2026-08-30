import type { ReactNode } from 'react';

interface LexicoonInfoCardProps {
  children: ReactNode;
  title: string;
}

export function LexicoonInfoCard({ children, title }: LexicoonInfoCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
        {title}
      </h3>
      {children}
    </article>
  );
}

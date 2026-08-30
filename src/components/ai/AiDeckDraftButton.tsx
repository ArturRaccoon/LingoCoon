'use client';

import { Check, X } from 'lucide-react';

interface AiDeckDraftButtonProps {
  disabled: boolean;
  label: string;
  primary?: boolean;
  onClick: () => void;
}

export function AiDeckDraftButton({
  disabled,
  label,
  primary = false,
  onClick,
}: AiDeckDraftButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors disabled:opacity-40 ${
        primary
          ? 'font-semibold text-gray-900 hover:bg-gray-200 hover:text-gray-900'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {primary ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </button>
  );
}

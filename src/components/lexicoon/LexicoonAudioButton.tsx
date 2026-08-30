import { Loader2, Volume2 } from 'lucide-react';

interface LexicoonAudioButtonProps {
  compact?: boolean;
  isLoading: boolean;
  label: string;
  onClick: () => void;
}

export function LexicoonAudioButton({
  compact = false,
  isLoading,
  label,
  onClick,
}: LexicoonAudioButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-label={label}
      title={label}
      className={`flex flex-shrink-0 items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-200 disabled:opacity-40 ${
        compact ? 'h-8 w-8' : 'h-10 w-10 bg-gray-50'
      }`}
    >
      {isLoading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Volume2 className="h-4 w-4" />
      }
    </button>
  );
}

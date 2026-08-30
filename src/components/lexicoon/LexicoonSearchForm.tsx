import { Loader2, Search } from 'lucide-react';
import { SpeechInputButton } from '@/components/stt/SpeechInputButton';

interface LexicoonSearchFormProps {
  disabled: boolean;
  hint: string;
  isLoading: boolean;
  label: string;
  onChange: (value: string) => void;
  onRecordingStart: () => void;
  onSearch: () => void;
  onTranscript: (text: string) => void;
  placeholder: string;
  searchLabel: string;
  speechLanguageCode: string;
  value: string;
}

const MAX_QUERY_LENGTH = 100;

export function LexicoonSearchForm({
  disabled,
  hint,
  isLoading,
  label,
  onChange,
  onRecordingStart,
  onSearch,
  onTranscript,
  placeholder,
  searchLabel,
  speechLanguageCode,
  value,
}: LexicoonSearchFormProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <label htmlFor="lexicoon-query" className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id="lexicoon-query"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, MAX_QUERY_LENGTH))}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            onSearch();
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-200 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onSearch}
          disabled={isLoading || !value.trim()}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
        >
          {isLoading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Search className="h-4 w-4" />
          }
          <span className="hidden sm:inline">{searchLabel}</span>
        </button>
        <SpeechInputButton
          disabled={isLoading}
          languageCode={speechLanguageCode}
          onRecordingStart={onRecordingStart}
          onTranscript={onTranscript}
        />
      </div>
      <p className="mt-2 text-xs text-gray-400">{hint}</p>
    </section>
  );
}

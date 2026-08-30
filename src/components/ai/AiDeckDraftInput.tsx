'use client';

interface AiDeckDraftInputProps {
  disabled: boolean;
  placeholder: string;
  value: string;
  autoFocus?: boolean;
  fullWidth?: boolean;
  onChange: (value: string) => void;
}

export function AiDeckDraftInput({
  disabled,
  placeholder,
  value,
  autoFocus = false,
  fullWidth = false,
  onChange,
}: AiDeckDraftInputProps) {
  return (
    <input
      autoFocus={autoFocus}
      type="text"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`${fullWidth ? 'w-full text-gray-500' : ''} rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none disabled:opacity-50`}
    />
  );
}

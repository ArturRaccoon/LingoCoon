'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { deleteDeck } from '@/lib/actions/deck-actions';

interface DeckActionsMenuProps {
  deckId: string;
  deckTitle: string;
}

export default function DeckActionsMenu({ deckId, deckTitle }: DeckActionsMenuProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!window.confirm(t('deck_actions.delete_confirm', { title: deckTitle }))) return;

    setIsDeleting(true);
    setError('');

    try {
      const result = await deleteDeck(deckId);
      if (result.error) {
        setError(result.error);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Could not delete the deck. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={() => void handleDelete()}
        disabled={isDeleting}
        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        {isDeleting ? t('deck_actions.deleting') : t('deck_actions.delete')}
      </button>
      {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}

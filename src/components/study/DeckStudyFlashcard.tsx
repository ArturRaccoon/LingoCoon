'use client';

import { Loader2, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DeckStudyFlashcardProps {
  back: string;
  exampleSentence: string | null;
  front: string;
  isAudioLoading: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  onPlayBack: (event: React.MouseEvent) => void;
  onPlayFront: (event: React.MouseEvent) => void;
}

export function DeckStudyFlashcard({
  back,
  exampleSentence,
  front,
  isAudioLoading,
  isFlipped,
  onFlip,
  onPlayBack,
  onPlayFront,
}: DeckStudyFlashcardProps) {
  const { t } = useTranslation();

  return (
    <div
      className="relative mb-8 cursor-pointer"
      style={{ aspectRatio: '2/3', perspective: '1000px' }}
      onClick={onFlip}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s ease',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div
          style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
          className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-gray-200 bg-white p-8 shadow-lg"
        >
          <AudioButton
            ariaLabel={t('tts.play_pronunciation')}
            isLoading={isAudioLoading}
            onClick={onPlayFront}
            iconClassName="text-gray-600"
            loadingClassName="text-gray-400"
            buttonClassName="border-gray-300 hover:bg-gray-100"
          />
          <p className="text-center text-3xl font-bold text-gray-900">{front}</p>
          <p className="text-sm text-gray-400">{t('study_session.evaluation.tap_to_reveal')}</p>
        </div>

        <div
          style={{
            backfaceVisibility: 'hidden',
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
          }}
          className="flex flex-col items-center justify-center gap-4 rounded-xl bg-gray-900 p-8 text-white shadow-lg"
        >
          <AudioButton
            ariaLabel={t('tts.play_pronunciation')}
            isLoading={isAudioLoading}
            onClick={onPlayBack}
            iconClassName="text-white"
            loadingClassName="text-white/60"
            buttonClassName="border-white/30 hover:bg-white/10"
          />
          <p className="text-center text-3xl font-bold">{back}</p>
          {exampleSentence && (
            <p className="px-2 text-center text-sm italic leading-relaxed text-white/50">
              {exampleSentence}
            </p>
          )}
          <p className="text-sm text-gray-400">{t('study_session.click_to_flip_back')}</p>
        </div>
      </div>
    </div>
  );
}

interface AudioButtonProps {
  ariaLabel: string;
  buttonClassName: string;
  iconClassName: string;
  isLoading: boolean;
  loadingClassName: string;
  onClick: (event: React.MouseEvent) => void;
}

function AudioButton({
  ariaLabel,
  buttonClassName,
  iconClassName,
  isLoading,
  loadingClassName,
  onClick,
}: AudioButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${buttonClassName}`}
      aria-label={ariaLabel}
    >
      {isLoading
        ? <Loader2 className={`h-4 w-4 animate-spin ${loadingClassName}`} />
        : <Volume2 className={`h-4 w-4 ${iconClassName}`} />
      }
    </button>
  );
}

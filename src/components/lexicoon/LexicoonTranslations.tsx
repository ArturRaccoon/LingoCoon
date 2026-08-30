import { LexicoonInfoCard } from '@/components/lexicoon/LexicoonInfoCard';
import type { LexicoonMeaning } from '@/types/lexicoon';

interface LexicoonTranslationsProps {
  meanings: LexicoonMeaning[];
  title: string;
}

export function LexicoonTranslations({ meanings, title }: LexicoonTranslationsProps) {
  return (
    <LexicoonInfoCard title={title}>
      <div className="grid gap-3 sm:grid-cols-2">
        {meanings.map((meaning, index) => (
          <div
            key={`${meaning.translation}-${index}`}
            className="rounded-xl border border-gray-900 bg-gray-900 px-4 py-3 text-white"
          >
            <p className="text-lg font-bold">{meaning.translation}</p>
            <p className="mt-1 text-xs text-gray-300">{meaning.partOfSpeech}</p>
          </div>
        ))}
      </div>
    </LexicoonInfoCard>
  );
}

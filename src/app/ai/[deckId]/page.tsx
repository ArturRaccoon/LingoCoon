
import { redirect } from 'next/navigation';

export default async function AiDeckRedirectPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  redirect(`/study/ai/${deckId}`);
}

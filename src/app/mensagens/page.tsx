import { redirect } from 'next/navigation';
import { auth } from '../../lib/auth';
import { MensagensClient } from './MensagensClient';

export const dynamic = 'force-dynamic';

export default async function MensagensPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/?auth=login&callbackUrl=/mensagens');
  }
  const sp = await searchParams;
  return (
    <MensagensClient
      currentUserId={session.user.id}
      initialConversationId={sp.c ?? null}
    />
  );
}

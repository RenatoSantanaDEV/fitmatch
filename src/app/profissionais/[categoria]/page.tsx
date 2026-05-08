import { redirect } from 'next/navigation';
import { auth } from '../../../lib/auth';
import { ListingClient } from './ListingClient';

export default async function ProfissionaisCategoriePage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(
      `/?${new URLSearchParams({ auth: 'login', callbackUrl: `/profissionais/${categoria}` }).toString()}`,
    );
  }

  return <ListingClient categoria={categoria} />;
}

import { redirect } from 'next/navigation';
import { auth } from '../../lib/auth';
import { FavoritosClient } from './FavoritosClient';

export default async function FavoritosPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/?${new URLSearchParams({ auth: 'login', callbackUrl: '/favoritos' }).toString()}`);
  }

  return <FavoritosClient />;
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '../../lib/auth';
import { DiscoverClient } from './DiscoverClient';

export default async function DescobrirPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/?${new URLSearchParams({ auth: 'login', callbackUrl: '/descobrir' }).toString()}`);
  }

  return (
    <>
      <noscript>
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          Ative JavaScript para usar a busca.{' '}
          <Link href="/recomendacoes" className="text-blue-600 underline">
            Ver recomendações por IA
          </Link>
        </div>
      </noscript>
      <DiscoverClient />
    </>
  );
}

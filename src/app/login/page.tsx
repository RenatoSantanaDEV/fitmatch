import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getOauthProviderFlags } from '../../lib/oauthConfig';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Entrar · FitMatch',
  description: 'Acesse sua conta para ver matches com professores.',
};

export default function LoginPage() {
  const showSeedHint = process.env.NODE_ENV === 'development';
  const oauth = getOauthProviderFlags();

  return (
    <main className="flex flex-1 flex-col bg-blue-600">
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-16">
      <Suspense
        fallback={
          <div className="h-72 w-full max-w-md animate-pulse rounded-2xl bg-blue-500/40" />
        }
      >
        <LoginForm showSeedHint={showSeedHint} oauth={oauth} />
      </Suspense>
      </div>
    </main>
  );
}

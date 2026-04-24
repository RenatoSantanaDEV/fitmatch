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
    <main className="fitmatch-hero-bg flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Suspense
        fallback={
          <div className="h-72 w-full max-w-md animate-pulse rounded-2xl border border-border-subtle bg-surface-elevated/80" />
        }
      >
        <LoginForm showSeedHint={showSeedHint} oauth={oauth} />
      </Suspense>
    </main>
  );
}

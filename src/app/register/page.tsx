import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getOauthProviderFlags } from '../../lib/oauthConfig';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
  title: 'Cadastro · FitMatch',
  description: 'Crie sua conta de aluno na FitMatch.',
};

export default function RegisterPage() {
  const oauth = getOauthProviderFlags();

  return (
    <main className="fitmatch-hero-bg flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Suspense
        fallback={
          <div className="h-96 w-full max-w-md animate-pulse rounded-2xl border border-border-subtle bg-surface-elevated/80" />
        }
      >
        <RegisterForm oauth={oauth} />
      </Suspense>
    </main>
  );
}

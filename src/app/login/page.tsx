import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Entrar · FitMatch',
  description: 'Acesse sua conta para ver matches com professores.',
};

export default function LoginPage() {
  const showSeedHint = process.env.NODE_ENV === 'development';

  return (
    <main className="fitmatch-hero-bg flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="h-64 w-full max-w-sm animate-pulse rounded-[var(--radius-card)] bg-surface-elevated" />}>
        <LoginForm showSeedHint={showSeedHint} />
      </Suspense>
    </main>
  );
}

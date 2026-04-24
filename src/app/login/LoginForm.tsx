'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { buttonVariants } from '../../components/ui/button-variants';

function safeCallbackUrl(raw: string | null): string {
  if (!raw) return '/matches';
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/matches';
}

export function LoginForm({ showSeedHint }: { showSeedHint: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error || res?.ok === false) {
        setError('Email ou senha incorretos.');
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-[var(--radius-card)] border border-border-subtle bg-surface p-8 shadow-sm dark:bg-surface-elevated">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">Entrar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Use sua conta para ver professores compatíveis e pedir novos matches.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">E-mail</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="rounded-lg border border-border-subtle bg-background px-3 py-2 text-foreground outline-none ring-brand/30 transition focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Senha</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="rounded-lg border border-border-subtle bg-background px-3 py-2 text-foreground outline-none ring-brand/30 transition focus:ring-2"
          />
        </label>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={buttonVariants({
            variant: 'primary',
            className: 'w-full justify-center disabled:cursor-not-allowed',
          })}
        >
          {loading ? 'Entrando…' : 'Continuar'}
        </button>
      </form>

      {showSeedHint && (
        <p className="mt-4 rounded-lg border border-dashed border-border-subtle bg-brand-soft/50 px-3 py-2 text-xs text-muted-foreground">
          Ambiente local: aluno de teste <span className="font-mono text-foreground">aluno@fitmatch.dev</span> — senha
          do seed em <span className="font-mono">prisma/seed.ts</span>.
        </p>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="font-medium text-brand hover:underline">
          Voltar à página inicial
        </Link>
      </p>
    </div>
  );
}

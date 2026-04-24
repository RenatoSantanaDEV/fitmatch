'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { buttonVariants } from '../../components/ui/button-variants';
import type { OauthProviderFlags } from '../../lib/oauthConfig';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthDivider } from '../../components/auth/AuthDivider';
import { OAuthButtons } from '../../components/auth/OAuthButtons';

function safeCallbackUrl(raw: string | null): string {
  if (!raw) return '/matches';
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/matches';
}

type Role = 'student' | 'professional';

const mockUsers: Record<Role, { label: string; email: string }[]> = {
  student: [
    { label: 'Renato Almeida', email: 'aluno@fitmatch.dev' },
  ],
  professional: [
    { label: 'Ana Martins — Personal Trainer', email: 'ana.personal@fitmatch.dev' },
    { label: 'Rafael Souza — CrossFit', email: 'rafael.crossfit@fitmatch.dev' },
    { label: 'Paula Ribeiro — Online', email: 'paula.online@fitmatch.dev' },
    { label: 'João Pereira — Yoga', email: 'joao.yoga@fitmatch.dev' },
    { label: 'Carla Nogueira — Pilates', email: 'carla.pilates@fitmatch.dev' },
    { label: 'Marcos Lima — Muay Thai', email: 'marcos.muaythai@fitmatch.dev' },
  ],
};

const SEED_PASSWORD = 'seed-password-123';

const inputClass =
  'rounded-xl border border-border-subtle bg-background px-3.5 py-2.5 text-sm text-foreground outline-none ring-brand/30 transition focus:ring-2 w-full';

export function LoginForm({
  showSeedHint,
  oauth,
}: {
  showSeedHint: boolean;
  oauth: OauthProviderFlags;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
  const initialRole = (searchParams.get('role') === 'professional' ? 'professional' : 'student') as Role;

  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasOAuth = oauth.google || oauth.facebook || oauth.apple;

  function fillMockUser(mockEmail: string) {
    setEmail(mockEmail);
    setPassword(SEED_PASSWORD);
    setError(null);
  }

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error || res?.ok === false) {
        setError('E-mail ou senha incorretos.');
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard>
      {/* Role tabs */}
      <div className="flex rounded-xl border border-border-subtle bg-background p-1">
        {(['student', 'professional'] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => { setRole(r); setEmail(''); setPassword(''); setError(null); }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              role === r
                ? 'bg-brand text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {r === 'student' ? 'Sou Aluno' : 'Sou Professor'}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {role === 'student' ? 'Entrar como Aluno' : 'Entrar como Professor'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {role === 'student'
            ? 'Acesse e receba matches com educadores físicos compatíveis.'
            : 'Acesse seu perfil profissional e gerencie seus alunos.'}
        </p>
      </div>

      {hasOAuth && (
        <>
          <div className="mt-6">
            <OAuthButtons oauth={oauth} callbackUrl={callbackUrl} />
          </div>
          <AuthDivider />
        </>
      )}

      {/* Mock user quick-fill */}
      {showSeedHint && (
        <div className="mt-4 rounded-xl border border-dashed border-border-subtle bg-surface p-3">
          <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Usuários mock (demo)
          </p>
          <div className="flex flex-col gap-1.5">
            {mockUsers[role].map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => fillMockUser(u.email)}
                className="flex items-center gap-2 rounded-lg border border-border-subtle bg-background px-3 py-2 text-left text-xs transition hover:border-brand/40 hover:bg-blue-50"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand font-bold uppercase text-[10px]">
                  {u.label.charAt(0)}
                </span>
                <span className="text-foreground font-medium">{u.label}</span>
                <span className="ml-auto text-muted-foreground font-mono">{u.email}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">E-mail</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className={inputClass}
            placeholder="seu@email.com"
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
            className={inputClass}
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={buttonVariants({
            variant: 'primary',
            className: 'mt-1 w-full justify-center disabled:cursor-not-allowed',
          })}
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem conta?{' '}
        <Link
          href={`/register?${new URLSearchParams({ callbackUrl }).toString()}`}
          className="font-semibold text-brand hover:underline"
        >
          Criar conta
        </Link>
      </p>

      <p className="mt-3 text-center text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          ← Voltar à página inicial
        </Link>
      </p>
    </AuthCard>
  );
}

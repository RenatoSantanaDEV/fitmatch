'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { buttonVariants } from '../ui/button-variants';
import type { OauthProviderFlags } from '../../lib/oauthConfig';
import { AuthCard } from './AuthCard';
import { AuthDivider } from './AuthDivider';
import { OAuthButtons } from './OAuthButtons';

export type AuthLoginRole = 'student' | 'professional';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100';

export function LoginForm({
  oauth,
  callbackUrl,
  initialRole = 'student',
  onSwitchToRegister,
  onClose,
  variant = 'page',
}: {
  oauth: OauthProviderFlags;
  callbackUrl: string;
  initialRole?: AuthLoginRole;
  onSwitchToRegister?: () => void;
  onClose?: () => void;
  variant?: 'page' | 'modal';
}) {
  const router = useRouter();
  const [role, setRole] = useState<AuthLoginRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasOAuth = oauth.google || oauth.facebook || oauth.apple;

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
      onClose?.();
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const body = (
    <>
      <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        {(['student', 'professional'] as AuthLoginRole[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRole(r);
              setEmail('');
              setPassword('');
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              role === r
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {r === 'student' ? 'Sou Aluno' : 'Sou Professor'}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <h1
          id={variant === 'modal' ? 'auth-modal-title' : undefined}
          className="text-xl font-bold tracking-tight text-slate-900"
        >
          {role === 'student' ? 'Entrar como Aluno' : 'Entrar como Professor'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {role === 'student'
            ? 'Acesse e veja recomendações de educadores físicos compatíveis com o seu perfil.'
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

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-800">E-mail</span>
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
          <span className="font-medium text-slate-800">Senha</span>
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

      {onSwitchToRegister ? (
        <p className="mt-6 text-center text-sm text-slate-500">
          Não tem conta?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-semibold text-blue-600 hover:underline"
          >
            Criar conta
          </button>
        </p>
      ) : null}

      {variant === 'modal' && onClose ? (
        <p className="mt-3 text-center text-sm">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            Voltar à página inicial
          </button>
        </p>
      ) : variant === 'page' ? (
        <p className="mt-3 text-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-slate-800">
            ← Voltar à página inicial
          </Link>
        </p>
      ) : null}
    </>
  );

  if (variant === 'modal') {
    return (
      <AuthCard className="max-w-none border-0 bg-transparent p-0 shadow-none">{body}</AuthCard>
    );
  }

  return <AuthCard>{body}</AuthCard>;
}

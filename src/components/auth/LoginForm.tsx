'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { OauthProviderFlags } from '../../lib/oauthConfig';
import { AuthCard } from './AuthCard';
import { AuthDivider } from './AuthDivider';
import { OAuthButtons } from './OAuthButtons';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

export function LoginForm({
  oauth,
  callbackUrl,
  onSwitchToRegister,
  onClose,
  variant = 'page',
}: {
  oauth: OauthProviderFlags;
  callbackUrl: string;
  onSwitchToRegister?: () => void;
  onClose?: () => void;
  variant?: 'page' | 'modal';
}) {
  const router = useRouter();
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
      <h1
        id={variant === 'modal' ? 'auth-modal-title' : undefined}
        className="text-xl font-extrabold tracking-tight text-slate-900"
      >
        Entrar na FitMatch
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Acesse sua conta com e-mail e senha.
      </p>

      {hasOAuth && (
        <>
          <div className="mt-6">
            <OAuthButtons oauth={oauth} callbackUrl={callbackUrl} />
          </div>
          <AuthDivider />
        </>
      )}

      <form onSubmit={onSubmit} className={`flex flex-col gap-4 ${hasOAuth ? '' : 'mt-6'}`}>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-slate-700">E-mail</span>
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
          <span className="font-semibold text-slate-700">Senha</span>
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
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex w-full items-center justify-center rounded-full bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-center text-sm">
        {onSwitchToRegister && (
          <p className="text-slate-500">
            Não tem conta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-emerald-600 hover:underline"
            >
              Criar conta
            </button>
          </p>
        )}
        <p className="text-slate-500">
          Quer dar aulas?{' '}
          <Link
            href="/dar-aulas"
            onClick={() => onClose?.()}
            className="font-semibold text-emerald-600 hover:underline"
          >
            Cadastre-se como professor
          </Link>
        </p>
        {variant === 'modal' && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
            Voltar à página inicial
          </button>
        )}
        {variant === 'page' && (
          <Link href="/" className="text-slate-400 hover:text-slate-700">
            ← Voltar à página inicial
          </Link>
        )}
      </div>
    </>
  );

  if (variant === 'modal') {
    return (
      <AuthCard className="max-w-none border-0 bg-transparent p-0 shadow-none">{body}</AuthCard>
    );
  }

  return <AuthCard>{body}</AuthCard>;
}

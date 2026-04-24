'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthDivider } from '../../components/auth/AuthDivider';
import { OAuthButtons } from '../../components/auth/OAuthButtons';
import { buttonVariants } from '../../components/ui/button-variants';
import type { OauthProviderFlags } from '../../lib/oauthConfig';

function safeCallbackUrl(raw: string | null): string {
  if (!raw) return '/matches';
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/matches';
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100';

export function RegisterForm({ oauth }: { oauth: OauthProviderFlags }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasOAuth = oauth.google || oauth.facebook || oauth.apple;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/register/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone.trim() || undefined,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          typeof body.error === 'string'
            ? body.error
            : Array.isArray(body.error)
              ? body.error.map((i: { message?: string }) => i.message).join(', ')
              : 'Não foi possível criar a conta.';
        setError(msg);
        return;
      }

      const sign = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (sign?.error || sign?.ok === false) {
        router.push(`/login?${new URLSearchParams({ callbackUrl }).toString()}`);
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
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Criar conta</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Cadastro de aluno. Depois você poderá completar seu perfil para matches ainda melhores.
      </p>

      {hasOAuth && (
        <>
          <div className="mt-8">
            <OAuthButtons oauth={oauth} callbackUrl={callbackUrl} />
          </div>
          <AuthDivider />
        </>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Nome completo</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            className={inputClass}
          />
        </label>
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
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Telefone (opcional)</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(ev) => setPhone(ev.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Senha</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className={inputClass}
          />
          <span className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</span>
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
          {loading ? 'Criando conta…' : 'Cadastrar com e-mail'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link
          href={`/login?${new URLSearchParams({ callbackUrl }).toString()}`}
          className="font-semibold text-brand hover:underline"
        >
          Entrar
        </Link>
      </p>

      <p className="mt-3 text-center text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Voltar à página inicial
        </Link>
      </p>
    </AuthCard>
  );
}

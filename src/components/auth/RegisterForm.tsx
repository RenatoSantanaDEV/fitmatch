'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthCard } from './AuthCard';
import { AuthDivider } from './AuthDivider';
import { OAuthButtons } from './OAuthButtons';
import { buttonVariants } from '../ui/button-variants';
import type { OauthProviderFlags } from '../../lib/oauthConfig';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100';

export function RegisterForm({
  oauth,
  callbackUrl,
  onSwitchToLogin,
  onSuccess,
  onClose,
  variant = 'page',
}: {
  oauth: OauthProviderFlags;
  callbackUrl: string;
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
  onClose?: () => void;
  variant?: 'page' | 'modal';
}) {
  const router = useRouter();
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
      let res: Response;
      try {
        res = await fetch('/api/student-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            name,
            email,
            password,
            phone: phone.trim() || undefined,
          }),
        });
      } catch {
        setError(
          'Não foi possível contactar o servidor. Confirme que está online, tente outra rede ou desative bloqueadores para este site.',
        );
        return;
      }

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

      let sign: Awaited<ReturnType<typeof signIn>>;
      try {
        sign = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
      } catch {
        setError('Conta criada, mas a sessão não iniciou. Use «Entrar» com o mesmo e-mail e senha.');
        onSwitchToLogin?.();
        return;
      }
      if (sign?.error || sign?.ok === false) {
        onSwitchToLogin?.();
        return;
      }
      onSuccess?.();
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
        className="text-2xl font-semibold tracking-tight text-slate-900"
      >
        Criar conta
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        Cadastro de aluno. Depois você poderá completar seu perfil para recomendações ainda melhores.
      </p>

      {hasOAuth && (
        <>
          <div className="mt-8">
            <OAuthButtons oauth={oauth} callbackUrl={callbackUrl} />
          </div>
          <AuthDivider />
        </>
      )}

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-800">Nome completo</span>
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
          <span className="font-medium text-slate-800">E-mail</span>
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
          <span className="font-medium text-slate-800">Telefone (opcional)</span>
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
          <span className="font-medium text-slate-800">Senha</span>
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
          <span className="text-xs text-slate-500">Mínimo de 8 caracteres.</span>
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

      {onSwitchToLogin ? (
        <p className="mt-8 text-center text-sm text-slate-500">
          Já tem conta?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-blue-600 hover:underline"
          >
            Entrar
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
            Voltar à página inicial
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

'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BadgeCheck, ChartNoAxesColumnIncreasing, Loader2, Star, Users } from 'lucide-react';
import type { OauthProviderFlags } from '../../lib/oauthConfig';
import { OAuthButtons } from './OAuthButtons';
import { AuthDivider } from './AuthDivider';

const inputClass =
  'w-full rounded-xl border border-slate-700/60 bg-slate-800/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20';

const benefits = [
  {
    icon: Users,
    text: 'Conecte-se com alunos que combinam com o seu perfil via IA',
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    text: 'Gerencie sessões, avaliações e agenda em um só lugar',
  },
  {
    icon: Star,
    text: 'Construa sua reputação com avaliações verificadas',
  },
  {
    icon: BadgeCheck,
    text: 'Seja exibido para alunos da sua cidade e especialidade',
  },
];

export function ProfessionalRegisterForm({
  oauth,
  callbackUrl,
  onSwitchToLogin,
  onSuccess,
  onClose,
}: {
  oauth: OauthProviderFlags;
  callbackUrl: string;
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
  onClose?: () => void;
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
        res = await fetch('/api/professional-signup', {
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
        setError('Não foi possível contactar o servidor. Verifique sua conexão.');
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
        sign = await signIn('credentials', { email, password, redirect: false });
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

  return (
    <div className="flex min-h-full flex-col">
      {/* Header premium */}
      <div className="-mx-5 -mt-11 rounded-t-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 px-6 pb-6 pt-10 sm:-mx-7 sm:-mt-11">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full bg-teal-400/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-teal-300">
            Para professores
          </span>
        </div>
        <h1 id="auth-modal-title" className="text-2xl font-bold tracking-tight text-white">
          Comece a dar aulas hoje
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
          Crie seu perfil profissional e apareça para alunos que precisam de você.
        </p>

        <ul className="mt-5 space-y-2.5">
          {benefits.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2.5 text-sm text-slate-200">
              <Icon className="mt-0.5 size-4 shrink-0 text-teal-400" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Form */}
      <div className="pt-6">
        {hasOAuth && (
          <>
            <OAuthButtons oauth={oauth} callbackUrl={callbackUrl} />
            <AuthDivider />
          </>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-800">Nome completo</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como aparecerá no seu perfil"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-800">E-mail profissional</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-800">
              WhatsApp / Telefone{' '}
              <span className="font-normal text-slate-400">(opcional)</span>
            </span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
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
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
            <span className="text-xs text-slate-500">Mínimo de 8 caracteres.</span>
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/30 transition hover:bg-teal-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {loading ? 'Criando perfil…' : 'Criar meu perfil de professor'}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          <p className="text-slate-500">
            Já tem conta?{' '}
            {onSwitchToLogin ? (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-semibold text-teal-600 hover:underline"
              >
                Entrar
              </button>
            ) : null}
          </p>
          {onClose && (
            <p>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700"
              >
                Voltar à página inicial
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

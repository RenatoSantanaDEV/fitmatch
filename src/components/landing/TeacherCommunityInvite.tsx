'use client';

import { ArrowRight, BadgeCheck, Brain, Gift, Loader2, Users } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthModal } from '../auth/AuthModalContext';

const benefits = [
  {
    icon: Brain,
    title: 'Apareça para os alunos certos',
    desc: 'Nossa IA exibe seu perfil para alunos cujos objetivos combinam com a sua especialidade.',
    color: 'bg-violet-500/15 text-violet-400',
  },
  {
    icon: Users,
    title: 'Gerencie tudo em um lugar',
    desc: 'Perfil, disponibilidade e avaliações numa plataforma feita para educadores físicos.',
    color: 'bg-emerald-500/15 text-emerald-400',
  },
  {
    icon: BadgeCheck,
    title: 'Credibilidade verificada',
    desc: 'Professores verificados recebem um selo que aumenta a taxa de contato dos alunos.',
    color: 'bg-orange-500/15 text-orange-400',
  },
  {
    icon: Gift,
    title: 'Gratuito para começar',
    desc: 'Crie seu perfil e receba contatos sem custo. Escale quando quiser.',
    color: 'bg-sky-500/15 text-sky-400',
  },
];

const AVATARS = ['E', 'M', 'R', 'J', 'A'];

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

export function TeacherCommunityInvite() {
  const { openLogin } = useAuthModal();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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
          body: JSON.stringify({ name, email, password }),
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

      const sign = await signIn('credentials', { email, password, redirect: false });
      if (sign?.error || sign?.ok === false) {
        setError(
          'Conta criada! Mas a sessão não iniciou. Use «Entrar como professor» com o mesmo e-mail.',
        );
        return;
      }

      router.push('/dar-aulas/completar-perfil');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col lg:flex-row">

      {/* ── LEFT: brand + benefits ── */}
      <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 px-8 py-16 sm:px-12 lg:py-28">

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-500/8 blur-3xl" />
        </div>

        <div className="relative max-w-lg">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
            Para educadores físicos
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl">
            Conecte-se a alunos que{' '}
            <span className="text-gradient-brand">precisam de você</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-300">
            Crie seu perfil na FitMatch e apareça nas recomendações por IA para alunos
            com objetivos compatíveis com a sua especialidade.
          </p>

          {/* Benefits grid */}
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {benefits.map(({ icon: Icon, title, desc, color }) => (
              <li
                key={title}
                className="flex flex-col gap-2.5 rounded-2xl border border-white/5 bg-white/[0.04] p-4"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="size-4" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-4 border-t border-white/10 pt-7">
            <div className="flex -space-x-2">
              {AVATARS.map((l) => (
                <div
                  key={l}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-600 text-xs font-extrabold text-white"
                >
                  {l}
                </div>
              ))}
            </div>
            <p className="text-sm leading-snug text-slate-300">
              <strong className="text-white">50+</strong> professores já fazem parte da plataforma
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: registration form ── */}
      <div className="flex flex-col items-center justify-center bg-slate-50 px-6 py-14 sm:px-10 lg:w-[480px] lg:shrink-0 lg:py-28">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Criar perfil de professor
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">Gratuito. Sem cartão de crédito.</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold text-slate-700">Nome completo</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como aparecerá no seu perfil"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold text-slate-700">E-mail</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="professor@email.com"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold text-slate-700">Senha</span>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className={inputClass}
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
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ArrowRight className="size-4" aria-hidden />
              )}
              {loading ? 'Criando perfil…' : 'Criar perfil gratuitamente'}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => openLogin({ callbackUrl: '/perfil' })}
                className="font-semibold text-emerald-600 hover:underline"
              >
                Entrar como professor
              </button>
            </p>
          </div>

          {/* <p className="mt-8 text-center text-xs leading-relaxed text-slate-400">
            Ao criar sua conta você concorda com os nossos{' '}
            <span className="underline">Termos de Uso</span> e{' '}
            <span className="underline">Política de Privacidade</span>.
          </p> */}
        </div>
      </div>
    </main>
  );
}

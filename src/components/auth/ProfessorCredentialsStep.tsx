'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const inputClass =
  'w-full rounded-xl border border-[#2D2A4A]/15 bg-white px-3.5 py-2.5 text-sm text-[#2D2A4A] placeholder:text-[#2D2A4A]/40 outline-none transition focus:border-[#FF6B6B]/60 focus:ring-2 focus:ring-[#FF6B6B]/15';

export function ProfessorCredentialsStep({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      let res: Response;
      try {
        res = await fetch('/api/professional-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ email, password }),
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
        setError('Conta criada, mas não foi possível iniciar a sessão. Use «Entrar» com o mesmo e-mail e senha.');
        return;
      }

      const next = `/dar-aulas/completar-perfil?${new URLSearchParams({ callbackUrl }).toString()}`;
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100dvh-3.75rem)] overflow-hidden bg-[#FFF9E5] px-4 py-14 sm:px-6">
      <div
        className="pointer-events-none absolute right-[-8%] top-[10%] h-[min(420px,75vw)] w-[min(420px,75vw)] rounded-full bg-[#FFD152]/45 blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-md">
        <p className="mb-6 text-center text-sm font-semibold text-[#2D2A4A]/65">
          <Link href="/dar-aulas" className="text-[#FF6B6B] hover:underline">
            ← Voltar
          </Link>
        </p>

        <div className="rounded-[1.25rem] bg-white p-7 shadow-xl shadow-[#2D2A4A]/10 ring-1 ring-black/[0.04] sm:p-8">
          <h1 className="text-xl font-bold text-[#2D2A4A]">Cadastro de professor · etapa 1 de 3</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#2D2A4A]/75">
            Crie seu acesso com e-mail e senha. Nas próximas telas você informa seu perfil e serviços.
          </p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[#2D2A4A]">E-mail</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="professor@email.com"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[#2D2A4A]">Senha</span>
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
              <span className="text-xs text-[#2D2A4A]/55">Mínimo de 8 caracteres.</span>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[#2D2A4A]">Confirmar senha</span>
              <input
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(ev) => setConfirm(ev.target.value)}
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
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B6B] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#FF6B6B]/25 transition hover:bg-[#ff5252] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B6B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {loading ? 'Criando acesso…' : 'Continuar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#2D2A4A]/65">
            Já tem conta?{' '}
            <button
              type="button"
              className="font-semibold text-[#FF6B6B] hover:underline"
              onClick={() => router.push('/?auth=login&role=professional&callbackUrl=' + encodeURIComponent(callbackUrl))}
            >
              Entrar como professor
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

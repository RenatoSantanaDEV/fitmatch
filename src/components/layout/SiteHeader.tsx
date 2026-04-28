'use client';

import Link from 'next/link';
import { CircleHelp, Heart, Search, Sparkles } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useAuthModal } from '../auth/AuthModalContext';

export function SiteHeader() {
  const { openLogin, openRegister } = useAuthModal();
  const { data: session, status } = useSession();

  const initial =
    (session?.user?.name?.trim()?.charAt(0) || session?.user?.email?.charAt(0) || '?').toUpperCase();

  return (
    <header
      className={
        status === 'authenticated'
          ? 'sticky top-0 z-50 border-b border-slate-200/90 bg-gradient-to-b from-slate-50 to-white shadow-sm backdrop-blur-md'
          : 'sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md'
      }
    >
      <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
              <circle cx="10" cy="10" r="3.5" fill="white" />
              <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <span className="truncate text-[15px] font-bold tracking-tight text-slate-900">FitMatch</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-end gap-0.5 sm:gap-1">
          {status === 'authenticated' ? (
            <>
              <Link
                href="/descobrir"
                className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-900 sm:inline-flex"
                title="Procurar professores"
              >
                <Search className="size-4 text-slate-500" aria-hidden />
                Procurar
              </Link>
              <Link
                href="/recomendacoes"
                className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-900 md:inline-flex"
                title="Lista gerada para si"
              >
                <Sparkles className="size-4 text-amber-500" aria-hidden />
                Recomendações
              </Link>
              <Link
                href="/descobrir"
                className="flex size-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-red-500"
                aria-label="Favoritos — na página Procurar"
                title="Favoritos (na página Procurar)"
              >
                <Heart className="size-[22px]" strokeWidth={1.75} aria-hidden />
              </Link>
              <Link
                href="/#ajuda-fitmatch"
                className="hidden size-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-800 lg:flex"
                aria-label="Ajuda"
                title="Ajuda"
              >
                <CircleHelp className="size-[22px]" strokeWidth={1.75} aria-hidden />
              </Link>
              <Link
                href="/perfil"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm ring-2 ring-blue-600/20 transition hover:bg-blue-700"
                aria-label="A minha conta"
                title="A minha conta"
              >
                {initial}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="ml-0.5 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 sm:px-4"
              >
                Sair
              </button>
            </>
          ) : status === 'unauthenticated' ? (
            <>
              <button
                type="button"
                onClick={() => openLogin({ callbackUrl: '/recomendacoes' })}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => openRegister({ callbackUrl: '/recomendacoes' })}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
              >
                Cadastrar
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useAuthModal } from '../auth/AuthModalContext';

export function SiteHeader() {
  const { openLogin, openRegister } = useAuthModal();
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
              <circle cx="10" cy="10" r="3.5" fill="white" />
              <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight text-slate-900">FitMatch</span>
        </Link>

        <nav className="flex items-center gap-3">
          {status === 'authenticated' ? (
            <>
              <Link
                href="/matches"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Meus matches
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Sair
              </button>
            </>
          ) : status === 'unauthenticated' ? (
            <>
              <button
                type="button"
                onClick={() => openLogin({ callbackUrl: '/matches' })}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => openRegister({ callbackUrl: '/matches' })}
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

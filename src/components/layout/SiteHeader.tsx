'use client';

import Link from 'next/link';
import {
  CircleHelp,
  Heart,
  Loader2,
  LogOut,
  Search,
  Sparkles,
  User,
  ChevronDown,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { useAuthModal } from '../auth/AuthModalContext';

export function SiteHeader() {
  const { openLogin, openRegister } = useAuthModal();
  const { data: session, status } = useSession();
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const initial =
    (session?.user?.name?.trim()?.charAt(0) || session?.user?.email?.charAt(0) || '?').toUpperCase();
  const displayName = session?.user?.name?.trim() || session?.user?.email || 'Conta';

  useEffect(() => {
    if (!accountOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">

        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90 active:opacity-80"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-600/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-[15px] font-extrabold tracking-tight text-slate-900">
            Fit<span className="text-emerald-600">Match</span>
          </span>
        </Link>

        <nav
          className="flex min-w-0 flex-1 items-center justify-end gap-1"
          aria-label="Navegação principal"
        >
          {status === 'authenticated' ? (
            <>
              <div className="hidden items-center gap-0.5 sm:flex">
                <Link
                  href="/descobrir"
                  className="header-icon-btn flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-emerald-700"
                  title="Buscar professores"
                >
                  <Search className="size-4" strokeWidth={2} aria-hidden />
                  <span className="hidden lg:inline">Buscar</span>
                </Link>
                <Link
                  href="/recomendacoes"
                  className="header-icon-btn flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                  title="Recomendações por IA"
                >
                  <Sparkles className="size-4" strokeWidth={2} aria-hidden />
                  <span className="hidden lg:inline">IA</span>
                </Link>
                <Link
                  href="/descobrir"
                  className="header-icon-btn flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                  title="Favoritos"
                >
                  <Heart className="size-4" strokeWidth={2} aria-hidden />
                  <span className="hidden lg:inline">Favoritos</span>
                </Link>
                <Link
                  href="/#ajuda-fitmatch"
                  className="header-icon-btn flex size-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  title="Ajuda"
                >
                  <CircleHelp className="size-4" strokeWidth={2} aria-hidden />
                </Link>
              </div>

              <div className="flex items-center gap-0.5 sm:hidden">
                <Link href="/descobrir" className="header-icon-btn flex size-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-emerald-700">
                  <Search className="size-4" aria-hidden />
                </Link>
                <Link href="/recomendacoes" className="header-icon-btn flex size-9 items-center justify-center rounded-full text-slate-600 hover:bg-violet-50 hover:text-violet-700">
                  <Sparkles className="size-4" aria-hidden />
                </Link>
              </div>

              <div className="relative ml-1 shrink-0" ref={accountRef}>
                <button
                  type="button"
                  id="header-account-trigger"
                  onClick={() => setAccountOpen((o) => !o)}
                  className="header-icon-btn flex cursor-pointer items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 py-1.5 pl-2 pr-3 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-controls="header-account-menu"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {initial}
                  </span>
                  <ChevronDown
                    className={`size-3.5 text-emerald-700 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </button>

                {accountOpen && (
                  <div
                    id="header-account-menu"
                    role="menu"
                    aria-labelledby="header-account-trigger"
                    className="header-dropdown-panel absolute right-0 z-50 mt-2 w-[min(100vw-1.5rem,15rem)] origin-top-right overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-black/[0.04]"
                  >
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                          <p className="text-xs text-emerald-700">Conta ativa</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link href="/recomendacoes" role="menuitem" className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                        <Sparkles className="size-4 shrink-0 text-violet-500" aria-hidden />
                        Recomendações IA
                      </Link>
                      <Link href="/descobrir" role="menuitem" className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                        <Heart className="size-4 shrink-0 text-rose-500" aria-hidden />
                        Favoritos
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 py-1">
                      <Link href="/perfil" role="menuitem" className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                        <User className="size-4 shrink-0 text-slate-500" aria-hidden />
                        Meu perfil
                      </Link>
                      <Link href="/#ajuda-fitmatch" role="menuitem" className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                        <CircleHelp className="size-4 shrink-0 text-slate-500" aria-hidden />
                        Ajuda
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 py-1">
                      <button
                        type="button"
                        role="menuitem"
                        disabled={signingOut}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => {
                          setSigningOut(true);
                          void signOut({ callbackUrl: '/' });
                        }}
                      >
                        {signingOut ? (
                          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                        ) : (
                          <LogOut className="size-4 shrink-0" aria-hidden />
                        )}
                        {signingOut ? 'Saindo…' : 'Sair da conta'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/dar-aulas"
                className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] sm:flex"
              >
                Dar aulas
              </Link>
              <button
                type="button"
                onClick={() => openLogin({ callbackUrl: '/recomendacoes' })}
                className="cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 active:scale-[0.98]"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => openRegister({ callbackUrl: '/recomendacoes' })}
                className="cursor-pointer rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                Cadastrar grátis
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

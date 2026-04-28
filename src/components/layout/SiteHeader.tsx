'use client';

import Link from 'next/link';
import {
  CircleHelp,
  Heart,
  Loader2,
  LogOut,
  Menu,
  Search,
  Sparkles,
  User,
  X,
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
    <header
      className={
        status === 'authenticated'
          ? 'sticky top-0 z-50 w-full border-b border-slate-200/90 bg-gradient-to-b from-slate-50 to-white shadow-sm backdrop-blur-md'
          : 'sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md'
      }
      aria-busy={status === 'loading'}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-2 sm:gap-2.5 sm:px-6 sm:py-2.5">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 transition-opacity hover:opacity-90 active:opacity-80"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-600/25 transition-transform active:scale-95">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
              <circle cx="10" cy="10" r="3.5" fill="white" />
              <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <span className="truncate text-[15px] font-bold tracking-tight text-slate-900">FitMatch</span>
        </Link>

        <nav
          className="flex min-w-0 flex-1 items-center justify-end gap-0.5 sm:gap-1"
          aria-label="Navegação principal"
        >
          {status === 'loading' ? (
            <div className="flex items-center gap-1 sm:gap-1.5" aria-hidden>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="size-9 animate-pulse rounded-full bg-slate-200/90 sm:size-10"
                />
              ))}
              <div className="h-10 w-[7rem] animate-pulse rounded-full bg-slate-200/90 sm:w-[7.25rem]" />
            </div>
          ) : status === 'authenticated' ? (
            <>
              <Link
                href="/descobrir"
                className="header-icon-btn flex size-9 items-center justify-center rounded-full text-slate-600 hover:bg-white hover:text-blue-600 sm:size-10"
                aria-label="Procurar professores"
                title="Procurar professores"
              >
                <Search className="size-[22px]" strokeWidth={1.75} aria-hidden />
              </Link>
              <Link
                href="/recomendacoes"
                className="header-icon-btn flex size-9 items-center justify-center rounded-full text-slate-600 hover:bg-white hover:text-amber-600 sm:size-10"
                aria-label="Recomendações por IA"
                title="Recomendações por IA"
              >
                <Sparkles className="size-[22px]" strokeWidth={1.75} aria-hidden />
              </Link>
              <Link
                href="/descobrir"
                className="header-icon-btn flex size-9 items-center justify-center rounded-full text-slate-600 hover:bg-white hover:text-red-500 sm:size-10"
                aria-label="Favoritos"
                title="Favoritos"
              >
                <Heart className="size-[22px]" strokeWidth={1.75} aria-hidden />
              </Link>
              <Link
                href="/#ajuda-fitmatch"
                className="header-icon-btn hidden size-9 items-center justify-center rounded-full text-slate-500 hover:bg-white hover:text-slate-800 sm:flex sm:size-10"
                aria-label="Ajuda"
                title="Ajuda"
              >
                <CircleHelp className="size-[22px]" strokeWidth={1.75} aria-hidden />
              </Link>

              <div className="relative shrink-0 pl-0.5" ref={accountRef}>
                <button
                  type="button"
                  id="header-account-trigger"
                  onClick={() => setAccountOpen((o) => !o)}
                  className="header-icon-btn flex items-center gap-0.5 rounded-full bg-blue-600 py-0.5 pl-2 pr-0.5 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-700/15 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 sm:gap-1 sm:py-1 sm:pl-2.5 sm:pr-1"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-controls="header-account-menu"
                >
                  <span className="flex size-8 items-center justify-center sm:size-9" aria-hidden>
                    {accountOpen ? (
                      <X className="size-[18px] opacity-95" strokeWidth={2.25} />
                    ) : (
                      <Menu className="size-[18px] opacity-95" strokeWidth={2.25} />
                    )}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600 sm:h-8 sm:w-8 sm:text-sm">
                    {initial}
                  </span>
                </button>

                {accountOpen ? (
                  <div
                    id="header-account-menu"
                    role="menu"
                    aria-labelledby="header-account-trigger"
                    className="header-dropdown-panel absolute right-0 z-50 mt-2 w-[min(100vw-1.5rem,16rem)] origin-top-right rounded-2xl border border-slate-100/90 bg-white py-1.5 shadow-xl shadow-slate-900/10 ring-1 ring-black/[0.04]"
                  >
                    <div className="px-3 pb-2 pt-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                    </div>

                    <div className="border-t border-slate-100 py-1">
                      <Link
                        href="/recomendacoes"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                        onClick={() => setAccountOpen(false)}
                      >
                        <Sparkles className="size-4 shrink-0 text-amber-500" aria-hidden />
                        Recomendações
                      </Link>
                      <Link
                        href="/descobrir"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                        onClick={() => setAccountOpen(false)}
                      >
                        <Heart className="size-4 shrink-0 text-rose-500" aria-hidden />
                        Favoritos
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 py-1">
                      <Link
                        href="/perfil"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                        onClick={() => setAccountOpen(false)}
                      >
                        <User className="size-4 shrink-0 text-slate-500" aria-hidden />
                        Meu perfil
                      </Link>
                      <Link
                        href="/#ajuda-fitmatch"
                        role="menuitem"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                        onClick={() => setAccountOpen(false)}
                      >
                        <CircleHelp className="size-4 shrink-0 text-slate-500" aria-hidden />
                        Ajuda
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        role="menuitem"
                        disabled={signingOut}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => {
                          setSigningOut(true);
                          void signOut({ callbackUrl: '/' });
                        }}
                      >
                        {signingOut ? (
                          <Loader2 className="size-4 shrink-0 animate-spin text-slate-500" aria-hidden />
                        ) : (
                          <LogOut className="size-4 shrink-0 text-slate-500" aria-hidden />
                        )}
                        Sair
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : status === 'unauthenticated' ? (
            <>
              <button
                type="button"
                onClick={() => openLogin({ callbackUrl: '/recomendacoes' })}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 active:scale-[0.98]"
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

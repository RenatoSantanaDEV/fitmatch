'use client';

import Link from 'next/link';
import {
  CircleHelp,
  Heart,
  Loader2,
  LogOut,
  MessageCircle,
  Search,
  User,
  ChevronDown,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { useAuthModal } from '../auth/AuthModalContext';

const UNREAD_POLL_INTERVAL_MS = 30_000;

export function SiteHeader() {
  const { openLogin, openRegister } = useAuthModal();
  const { data: session, status } = useSession();
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      setUnreadCount(0);
      return;
    }
    let cancelled = false;
    const refresh = async () => {
      try {
        const res = await fetch('/api/chat/conversations?summary=1', {
          credentials: 'include',
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { totalUnread?: number };
        if (!cancelled) setUnreadCount(data.totalUnread ?? 0);
      } catch {
        /* ignore */
      }
    };
    void refresh();
    const id = setInterval(() => void refresh(), UNREAD_POLL_INTERVAL_MS);
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [status]);

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-4 px-6 py-[14px] lg:px-10">

        <Link
          href="/"
          className="shrink-0 transition-opacity hover:opacity-80 active:opacity-70"
        >
          <span className="text-[19px] font-extrabold tracking-[-0.03em] text-slate-900">
            Fit<span className="text-emerald-600">Match</span>
          </span>
        </Link>

        <nav
          className="flex min-w-0 flex-1 items-center justify-end gap-1"
          aria-label="Navegação principal"
        >
          {status === 'authenticated' ? (
            <>
              <div className="hidden items-center sm:flex">
                <Link
                  href="/descobrir"
                  className="header-icon-btn flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  title="Buscar professores"
                >
                  <Search className="size-[15px]" strokeWidth={2} aria-hidden />
                  <span className="hidden lg:inline">Buscar</span>
                </Link>
                <Link
                  href="/mensagens"
                  className="header-icon-btn relative flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  title="Mensagens"
                >
                  <MessageCircle className="size-[15px]" strokeWidth={2} aria-hidden />
                  <span className="hidden lg:inline">Mensagens</span>
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/descobrir"
                  className="header-icon-btn flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  title="Favoritos"
                >
                  <Heart className="size-[15px]" strokeWidth={2} aria-hidden />
                  <span className="hidden lg:inline">Favoritos</span>
                </Link>
                <Link
                  href="/#ajuda-fitmatch"
                  className="header-icon-btn flex size-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                  title="Ajuda"
                >
                  <CircleHelp className="size-[15px]" strokeWidth={2} aria-hidden />
                </Link>
              </div>

              <div className="mr-1 h-5 w-px bg-slate-200 max-sm:hidden" aria-hidden />

              <div className="flex items-center gap-1 sm:hidden">
                <Link href="/descobrir" className="header-icon-btn flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                  <Search className="size-[15px]" aria-hidden />
                </Link>
                <Link
                  href="/mensagens"
                  className="header-icon-btn relative flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  title="Mensagens"
                >
                  <MessageCircle className="size-[15px]" aria-hidden />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </div>

              <div className="relative ml-1 shrink-0" ref={accountRef}>
                <button
                  type="button"
                  id="header-account-trigger"
                  onClick={() => setAccountOpen((o) => !o)}
                  className="header-icon-btn flex cursor-pointer items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-controls="header-account-menu"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {initial}
                  </span>
                  <ChevronDown
                    className={`size-3.5 text-slate-500 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>

                {accountOpen && (
                  <div
                    id="header-account-menu"
                    role="menu"
                    aria-labelledby="header-account-trigger"
                    className="header-dropdown-panel absolute right-0 z-50 mt-2 w-[min(100vw-1.5rem,15rem)] origin-top-right overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl shadow-slate-900/[0.08] ring-1 ring-black/[0.03]"
                  >
                    <div className="border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                          <p className="text-xs text-slate-400">Conta ativa</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link href="/mensagens" role="menuitem" className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                        <span className="flex items-center gap-3">
                          <MessageCircle className="size-4 shrink-0 text-slate-400" aria-hidden />
                          Mensagens
                        </span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link href="/descobrir" role="menuitem" className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                        <Heart className="size-4 shrink-0 text-slate-400" aria-hidden />
                        Favoritos
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 py-1">
                      <Link href="/perfil" role="menuitem" className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                        <User className="size-4 shrink-0 text-slate-400" aria-hidden />
                        Meu perfil
                      </Link>
                      <Link href="/#ajuda-fitmatch" role="menuitem" className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                        <CircleHelp className="size-4 shrink-0 text-slate-400" aria-hidden />
                        Ajuda
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 py-1">
                      <button
                        type="button"
                        role="menuitem"
                        disabled={signingOut}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="hidden items-center gap-1.5 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] sm:flex"
              >
                Dar aulas
              </Link>
              <button
                type="button"
                onClick={() => openLogin({ callbackUrl: '/descobrir' })}
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 active:scale-[0.98]"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => openRegister({ callbackUrl: '/descobrir' })}
                className="cursor-pointer rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
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

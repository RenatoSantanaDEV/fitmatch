'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { buttonVariants } from '../ui/button-variants';

const loginHref = `/login?${new URLSearchParams({ callbackUrl: '/matches' }).toString()}`;
const registerHref = `/register?${new URLSearchParams({ callbackUrl: '/matches' }).toString()}`;

export function SiteHeader() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 1.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">FitMatch</span>
        </Link>

        <nav className="flex items-center gap-2">
          {status === 'authenticated' ? (
            <>
              <Link
                href="/matches"
                className={buttonVariants({ variant: 'ghost', size: 'compact' })}
              >
                Meus matches
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className={buttonVariants({ variant: 'secondary', size: 'compact' })}
              >
                Sair
              </button>
            </>
          ) : status === 'unauthenticated' ? (
            <>
              <Link
                href={loginHref}
                className={buttonVariants({ variant: 'ghost', size: 'compact' })}
              >
                Entrar
              </Link>
              <Link
                href={registerHref}
                className={buttonVariants({ variant: 'primary', size: 'compact' })}
              >
                Cadastrar
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

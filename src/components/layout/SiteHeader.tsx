'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { buttonVariants } from '../ui/button-variants';

const loginWithMatchesCallback = `/login?${new URLSearchParams({
  callbackUrl: '/matches',
}).toString()}`;

const registerWithMatchesCallback = `/register?${new URLSearchParams({
  callbackUrl: '/matches',
}).toString()}`;

export function SiteHeader() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
          FitMatch
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          {status === 'authenticated' ? (
            <>
              <Link
                href="/matches"
                className={buttonVariants({ variant: 'secondary', size: 'compact' })}
              >
                Meus matches
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className={buttonVariants({ variant: 'ghost', size: 'compact' })}
              >
                Sair
              </button>
            </>
          ) : status === 'unauthenticated' ? (
            <>
              <Link
                href={registerWithMatchesCallback}
                className={buttonVariants({ variant: 'secondary', size: 'compact' })}
              >
                Cadastrar
              </Link>
              <Link
                href={loginWithMatchesCallback}
                className={buttonVariants({ variant: 'primary', size: 'compact' })}
              >
                Entrar
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

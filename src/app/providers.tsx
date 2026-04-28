'use client';

import { SessionProvider } from 'next-auth/react';
import { Suspense, type ReactNode } from 'react';
import { AuthModalProvider, AuthUrlSync } from '../components/auth/AuthModalContext';
import type { OauthProviderFlags } from '../lib/oauthConfig';

export function Providers({
  children,
  oauth,
}: {
  children: ReactNode;
  oauth: OauthProviderFlags;
}) {
  return (
    <SessionProvider>
      <AuthModalProvider oauth={oauth}>
        {children}
        <Suspense fallback={null}>
          <AuthUrlSync />
        </Suspense>
      </AuthModalProvider>
    </SessionProvider>
  );
}

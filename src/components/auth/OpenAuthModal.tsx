'use client';

import type { ReactNode } from 'react';
import { useAuthModal } from './AuthModalContext';
import type { AuthLoginRole } from './LoginForm';

export function OpenAuthModal({
  mode,
  callbackUrl = '/matches',
  role = 'student',
  className,
  children,
}: {
  mode: 'login' | 'register';
  callbackUrl?: string;
  role?: AuthLoginRole;
  className?: string;
  children: ReactNode;
}) {
  const { openLogin, openRegister } = useAuthModal();
  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        mode === 'login' ? openLogin({ callbackUrl, role }) : openRegister({ callbackUrl })
      }
    >
      {children}
    </button>
  );
}

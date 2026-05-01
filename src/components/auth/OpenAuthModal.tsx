'use client';

import type { ReactNode } from 'react';
import { useAuthModal } from './AuthModalContext';
import type { AuthLoginRole } from './LoginForm';

export function OpenAuthModal({
  mode,
  callbackUrl = '/recomendacoes',
  role = 'student',
  className,
  children,
}: {
  mode: 'login' | 'register' | 'register-professional';
  callbackUrl?: string;
  role?: AuthLoginRole;
  className?: string;
  children: ReactNode;
}) {
  const { openLogin, openRegister, openRegisterProfessional } = useAuthModal();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (mode === 'login') openLogin({ callbackUrl, role });
        else if (mode === 'register-professional') openRegisterProfessional({ callbackUrl });
        else openRegister({ callbackUrl });
      }}
    >
      {children}
    </button>
  );
}

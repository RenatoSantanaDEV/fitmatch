'use client';

import type { ReactNode } from 'react';
import { useAuthModal } from './AuthModalContext';

export function OpenAuthModal({
  mode,
  callbackUrl = '/recomendacoes',
  className,
  children,
}: {
  mode: 'login' | 'register' | 'register-professional';
  callbackUrl?: string;
  className?: string;
  children: ReactNode;
}) {
  const { openLogin, openRegister, openRegisterProfessional } = useAuthModal();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (mode === 'login') openLogin({ callbackUrl });
        else if (mode === 'register-professional') openRegisterProfessional();
        else openRegister({ callbackUrl });
      }}
    >
      {children}
    </button>
  );
}

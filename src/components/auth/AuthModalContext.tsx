'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { OauthProviderFlags } from '../../lib/oauthConfig';
import { LoginForm, type AuthLoginRole } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ProfessionalRegisterForm } from './ProfessionalRegisterForm';

type ModalMode = 'login' | 'register' | 'register-professional';

type OpenLoginOpts = { callbackUrl?: string; role?: AuthLoginRole };
type OpenRegisterOpts = { callbackUrl?: string };

type AuthModalContextValue = {
  openLogin: (opts?: OpenLoginOpts) => void;
  openRegister: (opts?: OpenRegisterOpts) => void;
  openRegisterProfessional: (opts?: OpenRegisterOpts) => void;
  close: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}

export function AuthModalProvider({
  children,
  oauth,
}: {
  children: ReactNode;
  oauth: OauthProviderFlags;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>('login');
  const [callbackUrl, setCallbackUrl] = useState('/recomendacoes');
  const [loginRole, setLoginRole] = useState<AuthLoginRole>('student');

  const close = useCallback(() => setOpen(false), []);

  const openLogin = useCallback((opts?: OpenLoginOpts) => {
    setCallbackUrl(safeRelativeCallback(opts?.callbackUrl ?? null));
    setLoginRole(opts?.role ?? 'student');
    setMode('login');
    setOpen(true);
  }, []);

  const openRegister = useCallback((opts?: OpenRegisterOpts) => {
    setCallbackUrl(safeRelativeCallback(opts?.callbackUrl ?? null));
    setMode('register');
    setOpen(true);
  }, []);

  const openRegisterProfessional = useCallback((opts?: OpenRegisterOpts) => {
    setCallbackUrl(safeRelativeCallback(opts?.callbackUrl ?? null));
    setMode('register-professional');
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ openLogin, openRegister, openRegisterProfessional, close }),
    [openLogin, openRegister, openRegisterProfessional, close],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isProfessional = mode === 'register-professional';

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {open ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border bg-white shadow-2xl ${
              isProfessional
                ? 'max-w-lg border-slate-700/30'
                : 'max-w-md border-slate-200'
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full transition ${
                isProfessional
                  ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
              aria-label="Fechar"
            >
              <span className="text-xl leading-none" aria-hidden>×</span>
            </button>

            <div className={isProfessional ? 'p-5 pt-11 sm:p-7 sm:pt-11' : 'p-5 pt-10 sm:p-7 sm:pt-11'}>
              {mode === 'login' && (
                <LoginForm
                  oauth={oauth}
                  callbackUrl={callbackUrl}
                  initialRole={loginRole}
                  onSwitchToRegister={() => setMode('register')}
                  onClose={close}
                  variant="modal"
                />
              )}
              {mode === 'register' && (
                <RegisterForm
                  oauth={oauth}
                  callbackUrl={callbackUrl}
                  onSwitchToLogin={() => setMode('login')}
                  onSuccess={close}
                  onClose={close}
                  variant="modal"
                />
              )}
              {mode === 'register-professional' && (
                <ProfessionalRegisterForm
                  oauth={oauth}
                  callbackUrl={callbackUrl}
                  onSwitchToLogin={() => setMode('login')}
                  onSuccess={close}
                  onClose={close}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </AuthModalContext.Provider>
  );
}

function safeRelativeCallback(raw: string | null | undefined): string {
  if (!raw) return '/recomendacoes';
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/recomendacoes';
}

export function AuthUrlSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openLogin, openRegister, openRegisterProfessional } = useAuthModal();

  useEffect(() => {
    const auth = searchParams.get('auth');
    if (auth !== 'login' && auth !== 'register') return;

    const cb = safeRelativeCallback(searchParams.get('callbackUrl'));
    const role = searchParams.get('role');

    if (auth === 'login') {
      openLogin({ callbackUrl: cb, role: role === 'professional' ? 'professional' : 'student' });
    } else if (role === 'professional') {
      openRegisterProfessional({ callbackUrl: cb });
    } else {
      openRegister({ callbackUrl: cb });
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('auth');
    url.searchParams.delete('callbackUrl');
    url.searchParams.delete('role');
    const next =
      url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '');
    router.replace(next, { scroll: false });
  }, [searchParams, router, openLogin, openRegister, openRegisterProfessional]);

  return null;
}

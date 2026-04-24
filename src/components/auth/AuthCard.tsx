import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function AuthCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg',
        className,
      )}
    >
      {children}
    </div>
  );
}

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
        'w-full max-w-md rounded-2xl border border-border-subtle bg-surface/90 p-8 shadow-lg backdrop-blur-md dark:bg-surface-elevated/95',
        className,
      )}
    >
      {children}
    </div>
  );
}

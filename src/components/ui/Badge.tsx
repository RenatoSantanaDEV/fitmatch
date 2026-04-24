import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type BadgeVariant = 'default' | 'outline';

const variantClass: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-brand-soft text-brand',
  outline: 'border-border-subtle bg-surface/80 text-muted backdrop-blur-sm',
};

export function Badge({
  children,
  variant = 'outline',
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide',
        variantClass[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

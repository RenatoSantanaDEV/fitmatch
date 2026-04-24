import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function FeatureCard({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-[var(--radius-card)] border border-border-subtle bg-surface p-5 text-left shadow-sm transition hover:border-brand/25 hover:shadow-md dark:bg-surface-elevated',
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

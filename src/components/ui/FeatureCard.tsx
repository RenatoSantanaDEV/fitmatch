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
        'flex flex-col gap-3 rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-100 hover:shadow-md',
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

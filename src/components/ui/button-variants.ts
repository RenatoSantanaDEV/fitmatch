import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'default' | 'compact';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';

const sizes: Record<ButtonSize, string> = {
  default: 'px-6 py-3',
  compact: 'px-5 py-2.5',
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-brand-foreground shadow-sm hover:bg-brand-hover active:scale-[0.99]',
  secondary:
    'border border-border-subtle bg-surface text-foreground hover:border-muted-foreground/40 hover:bg-surface-elevated',
  ghost:
    'border border-transparent text-foreground hover:bg-surface-elevated hover:border-border-subtle',
};

export function buttonVariants(options: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): string {
  const variant = options.variant ?? 'primary';
  const size = options.size ?? 'default';
  return cn(base, sizes[size], variants[variant], options.className);
}

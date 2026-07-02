import { Zap } from 'lucide-react';

interface BoostBadgeProps {
  isBoosted: boolean;
  boostTier: 'BASICO' | 'PLUS' | 'PREMIUM' | null;
  /** `sm` matches the inline row-card style; `md` is denser-legible for grid/carousel cards. */
  size?: 'sm' | 'md';
}

export function BoostBadge({ isBoosted, boostTier, size = 'sm' }: BoostBadgeProps) {
  if (!isBoosted || !boostTier) return null;

  const sizeClass = size === 'md' ? 'px-2 py-1 text-[11px]' : 'px-1.5 py-0.5 text-[10px]';

  if (boostTier === 'PREMIUM') {
    return (
      <span className={`inline-flex items-center gap-0.5 rounded-md border border-yellow-300 bg-yellow-50 font-semibold text-yellow-700 ${sizeClass}`}>
        <Zap className="size-2.5" aria-hidden />
        Super Destaque
      </span>
    );
  }

  if (boostTier === 'PLUS') {
    return (
      <span className={`inline-flex items-center rounded-md border border-blue-200 bg-blue-50 font-semibold text-blue-700 ${sizeClass}`}>
        Destaque+
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-md border border-amber-200 bg-amber-50 font-semibold text-amber-700 ${sizeClass}`}>
      Destaque
    </span>
  );
}

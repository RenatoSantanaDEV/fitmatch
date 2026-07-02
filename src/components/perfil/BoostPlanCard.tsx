'use client';

import { Check, Loader2 } from 'lucide-react';
import {
  BOOST_DURATION_DAYS,
  BOOST_LABEL,
  BOOST_PRICE_CENTS,
  BoostTier,
} from '../../domain/enums/BoostTier';
import { cn } from '../../lib/cn';

export const BOOST_PLAN_OPTIONS = [
  {
    tier: BoostTier.BASICO,
    benefits: [
      'Aparece antes de perfis sem impulso',
      'Selo "Destaque" no card',
      '7 dias de visibilidade',
    ],
    accentClass: 'bg-amber-500',
    buttonClass: 'bg-amber-600 hover:bg-amber-800',
    highlighted: false,
  },
  {
    tier: BoostTier.PLUS,
    benefits: [
      'Tudo do Destaque',
      'Bônus no ranking de compatibilidade IA',
      'Selo "Destaque+" no card',
      '15 dias de visibilidade',
    ],
    accentClass: 'bg-brand',
    buttonClass: 'bg-brand hover:bg-brand-hover',
    highlighted: true,
  },
  {
    tier: BoostTier.PREMIUM,
    benefits: [
      'Tudo do Destaque+',
      'Maior bônus no ranking IA',
      'Selo "Super Destaque" no card',
      '30 dias de visibilidade',
    ],
    accentClass: 'bg-slate-700',
    buttonClass: 'bg-slate-900 hover:bg-slate-800',
    highlighted: false,
  },
] as const;

function formatBoostPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

interface BoostPlanCardProps {
  tier: BoostTier;
  benefits: readonly string[];
  accentClass: string;
  buttonClass: string;
  highlighted?: boolean;
  disabled: boolean;
  loading: boolean;
  hasActiveBoost: boolean;
  onSelect: () => void;
}

export function BoostPlanCard({
  tier,
  benefits,
  accentClass,
  buttonClass,
  highlighted = false,
  disabled,
  loading,
  hasActiveBoost,
  onSelect,
}: BoostPlanCardProps) {
  const label = BOOST_LABEL[tier];
  const price = formatBoostPrice(BOOST_PRICE_CENTS[tier]);
  const days = BOOST_DURATION_DAYS[tier];
  const buttonText = hasActiveBoost ? 'Impulso ativo' : 'Impulsionar agora';

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border bg-white p-5',
        highlighted ? 'border-brand/25 shadow-sm shadow-brand/5' : 'border-slate-200',
      )}
    >
      {highlighted ? (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-brand/20 bg-brand-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-text">
          Mais popular
        </span>
      ) : null}

      <div className={cn('mb-4 h-1 w-9 rounded-full', accentClass)} aria-hidden />

      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{price}</p>
      <p className="text-xs text-slate-400">{days} dias</p>

      <ul className="mt-4 flex-1 space-y-2 text-xs leading-relaxed text-slate-600">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <Check className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
            {benefit}
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        aria-busy={loading}
        className={cn(
          'relative mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          buttonClass,
        )}
      >
        <span className={cn('inline-flex items-center justify-center px-3', loading && 'invisible')}>
          {buttonText}
        </span>
        {loading ? (
          <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <Loader2 className="size-4 animate-spin" />
          </span>
        ) : null}
        {loading ? <span className="sr-only">Processando pagamento…</span> : null}
      </button>
    </div>
  );
}

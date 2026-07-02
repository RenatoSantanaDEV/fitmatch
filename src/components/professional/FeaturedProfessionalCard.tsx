import Link from 'next/link';
import { BadgeCheck, MapPin, Star } from 'lucide-react';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';
import { getPersonDisplayInitials, formatSessionPriceRange } from '../../app/descobrir/discoverFormatters';
import { PROFESSIONAL_CARD_GRADIENTS } from '../../app/descobrir/discoverUiConstants';
import { BoostBadge } from './BoostBadge';

interface FeaturedProfessionalCardProps {
  professional: ProfessionalResponseDTO;
  gradientIndex?: number;
}

export function FeaturedProfessionalCard({ professional, gradientIndex = 0 }: FeaturedProfessionalCardProps) {
  const initials = getPersonDisplayInitials(professional.displayName);
  const gradient = PROFESSIONAL_CARD_GRADIENTS[gradientIndex % PROFESSIONAL_CARD_GRADIENTS.length];
  const primaryArea = professional.areas[0];

  return (
    <Link
      href={`/perfil/${professional.userId}`}
      className="group flex w-[15.5rem] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-100 bg-white transition hover:border-slate-200 hover:shadow-sm"
    >
      <div className={`relative flex h-24 w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
        {professional.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/profile/avatar/${professional.userId}`}
            alt={professional.displayName}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <span className="select-none text-2xl font-bold tracking-tight text-white/95">{initials}</span>
        )}
        <div className="absolute left-2.5 top-2.5">
          <BoostBadge isBoosted={professional.isBoosted} boostTier={professional.boostTier} size="md" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex min-w-0 items-center gap-1">
          <p className="truncate text-sm font-semibold text-slate-900">{professional.displayName}</p>
          {professional.isVerified ? (
            <BadgeCheck className="size-3.5 shrink-0 text-brand" aria-label="Verificado" />
          ) : null}
        </div>

        {primaryArea ? (
          <p className="truncate text-xs text-slate-500">{primaryArea.nome}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="flex min-w-0 items-center gap-1 text-[11px] text-slate-400">
            <MapPin className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{professional.location.city}</span>
          </span>
          {professional.averageRating != null ? (
            <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-slate-600">
              <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
              {professional.averageRating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <p className="text-xs font-semibold text-slate-800">
          {formatSessionPriceRange(
            professional.sessionPrice.min,
            professional.sessionPrice.max,
            professional.sessionPrice.currency,
          )}
          <span className="ml-0.5 font-normal text-slate-400">/aula</span>
        </p>
      </div>
    </Link>
  );
}

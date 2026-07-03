import Link from 'next/link';
import { Star } from 'lucide-react';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';
import {
  formatModalitiesCaption,
  formatSessionPriceRange,
  getPersonDisplayInitials,
} from '../../app/descobrir/discoverFormatters';
import { PROFESSIONAL_CARD_GRADIENTS } from '../../app/descobrir/discoverUiConstants';
import { BoostBadge } from '../professional/BoostBadge';

interface HomeProfessionalGridCardProps {
  professional: ProfessionalResponseDTO;
  gradientIndex?: number;
}

function formatLocationModality(professional: ProfessionalResponseDTO): string {
  const city = professional.location.city;
  const modality = formatModalitiesCaption(professional.modalities);
  if (modality) return `${city} (${modality.toLowerCase()})`;
  return city;
}

function formatPricePerSession(professional: ProfessionalResponseDTO): string {
  const { min, max, currency } = professional.sessionPrice;
  if (min === max) {
    try {
      return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(min)}/aula`;
    } catch {
      return `${min}/aula`;
    }
  }
  return `${formatSessionPriceRange(min, max, currency)}/aula`;
}

export function HomeProfessionalGridCard({
  professional,
  gradientIndex = 0,
}: HomeProfessionalGridCardProps) {
  const initials = getPersonDisplayInitials(professional.displayName);
  const gradient = PROFESSIONAL_CARD_GRADIENTS[gradientIndex % PROFESSIONAL_CARD_GRADIENTS.length];
  const primaryArea = professional.areas[0]?.nome;
  const bioSnippet = professional.bio.trim().slice(0, 120);

  return (
    <Link
      href={`/perfil/${professional.userId}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${gradient}`}>
        {professional.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/profile/avatar/${professional.userId}`}
            alt={professional.displayName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="select-none text-5xl font-bold text-white/90">{initials}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute left-3 top-3">
          <BoostBadge isBoosted={professional.isBoosted} boostTier={professional.boostTier} size="md" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="truncate text-lg font-bold text-white">{professional.displayName}</p>
          <p className="mt-0.5 truncate text-sm text-white/85">{formatLocationModality(professional)}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {professional.averageRating != null ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
              {professional.averageRating.toFixed(1)}
              {professional.totalReviews > 0 ? (
                <span className="font-normal text-slate-500">
                  ({professional.totalReviews}{' '}
                  {professional.totalReviews === 1 ? 'avaliação' : 'avaliações'})
                </span>
              ) : null}
            </span>
          ) : (
            <span className="text-sm text-slate-400">Sem avaliações ainda</span>
          )}
          {professional.isVerified ? (
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-text">
              Verificado
            </span>
          ) : null}
        </div>

        {primaryArea || bioSnippet ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
            {primaryArea ? (
              <>
                <span className="font-semibold text-slate-800">{primaryArea}</span>
                {bioSnippet ? ` — ${bioSnippet}${professional.bio.length > 120 ? '…' : ''}` : null}
              </>
            ) : (
              bioSnippet
            )}
          </p>
        ) : null}

        <p className="mt-auto pt-1 text-sm font-bold text-slate-900">{formatPricePerSession(professional)}</p>
      </div>
    </Link>
  );
}

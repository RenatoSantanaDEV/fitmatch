import Link from 'next/link';
import {
  BadgeCheck,
  Heart,
  MapPin,
  Monitor,
  Star,
  Users,
} from 'lucide-react';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';
import {
  formatModalitiesCaption,
  formatSessionPriceRange,
  getPersonDisplayInitials,
  isTopRatedProfessional,
  RATING_STAR_SLOTS,
} from './discoverFormatters';
import { SessionModality } from '../../domain/enums/SessionModality';
import { BoostBadge } from '../../components/professional/BoostBadge';

interface DiscoverProfessionalCardProps {
  professional: ProfessionalResponseDTO;
  cardIndex: number;
  isFavorite: boolean;
  onToggleFavorite: (professionalId: string) => void;
}

function ModalityIcon({ modalities }: { modalities: SessionModality[] }) {
  const hasOnline = modalities.includes(SessionModality.ONLINE);
  const hasInPerson = modalities.includes(SessionModality.IN_PERSON);
  if (hasOnline && hasInPerson) return <Monitor className="size-3.5 shrink-0 text-slate-400" aria-hidden />;
  if (hasOnline) return <Monitor className="size-3.5 shrink-0 text-slate-400" aria-hidden />;
  return <Users className="size-3.5 shrink-0 text-slate-400" aria-hidden />;
}

export function DiscoverProfessionalCard({
  professional,
  isFavorite,
  onToggleFavorite,
}: DiscoverProfessionalCardProps) {
  const avatarInitials = getPersonDisplayInitials(professional.displayName);
  const modalitiesCaption = formatModalitiesCaption(professional.modalities);
  const showTopBadge = isTopRatedProfessional(
    professional.averageRating,
    professional.totalReviews,
  );
  const roundedRating = professional.averageRating != null
    ? Math.round(professional.averageRating)
    : null;
  const primaryArea = professional.areas[0];

  return (
    <li className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:gap-5 sm:p-5">

      {/* Photo / Avatar */}
      <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-24 sm:w-24">
        {professional.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/profile/avatar/${professional.userId}`}
            alt={professional.displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-emerald-600">
            <span className="text-2xl font-bold text-white">{avatarInitials}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">

        {/* Top row: name + badges + favorite */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 leading-tight">
                {professional.displayName}
              </h3>
              {professional.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <BadgeCheck className="size-2.5" aria-hidden />
                  Verificado
                </span>
              )}
              <BoostBadge isBoosted={professional.isBoosted} boostTier={professional.boostTier} />
              {showTopBadge && (
                <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                  Top avaliado
                </span>
              )}
            </div>
            {primaryArea && (
              <p className="mt-0.5 text-sm text-slate-500">{primaryArea.nome}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(professional.id)}
            className={`flex size-8 shrink-0 items-center justify-center rounded-md transition-colors ${
              isFavorite
                ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                : 'text-slate-300 hover:bg-slate-100 hover:text-rose-400'
            }`}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              className={`size-4 ${isFavorite ? 'fill-rose-500' : ''}`}
              strokeWidth={isFavorite ? 0 : 1.75}
              aria-hidden
            />
          </button>
        </div>

        {/* Rating */}
        {professional.averageRating != null ? (
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {RATING_STAR_SLOTS.map((slot) => (
                <Star
                  key={slot}
                  className={`size-3.5 ${
                    roundedRating !== null && slot <= roundedRating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-200 text-slate-200'
                  }`}
                  aria-hidden
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {professional.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">
              ({professional.totalReviews} avaliações)
            </span>
          </div>
        ) : (
          <span className="text-xs italic text-slate-400">Sem avaliações ainda</span>
        )}

        {/* Bio */}
        {professional.bio && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {professional.bio}
          </p>
        )}

        {/* Specialty tags */}
        {professional.areas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {professional.areas.slice(0, 4).map((area) => (
              <span
                key={area.id}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {area.nome}
              </span>
            ))}
            {professional.areas.length > 4 && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-400">
                +{professional.areas.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Meta row: location + modality + price */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            {professional.location.city}
            {professional.location.state ? `, ${professional.location.state}` : ''}
          </span>
          {modalitiesCaption && (
            <span className="flex items-center gap-1">
              <ModalityIcon modalities={professional.modalities} />
              {modalitiesCaption}
            </span>
          )}
          <span className="font-semibold text-slate-700">
            {formatSessionPriceRange(
              professional.sessionPrice.min,
              professional.sessionPrice.max,
              professional.sessionPrice.currency,
            )}
            <span className="ml-0.5 font-normal text-slate-400">/aula</span>
          </span>
          {professional.yearsExperience > 0 && (
            <span>{professional.yearsExperience} anos de exp.</span>
          )}
        </div>

        {/* Bottom row: accepting + CTA */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
          {professional.isAcceptingClients ? (
            <p className="text-[11px] font-medium text-emerald-600">
              ✓ Aceita novos alunos
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">Agenda lotada</p>
          )}
          <Link
            href={`/perfil/${professional.userId}`}
            className="shrink-0 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            Ver perfil
          </Link>
        </div>
      </div>
    </li>
  );
}

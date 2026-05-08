import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  MapPin,
  Sparkles,
  Star,
} from 'lucide-react';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';
import {
  formatModalitiesCaption,
  formatSessionPriceRange,
  getPersonDisplayInitials,
  isTopRatedProfessional,
  RATING_STAR_SLOTS,
} from './discoverFormatters';
import { PROFESSIONAL_CARD_GRADIENTS } from './discoverUiConstants';

interface DiscoverProfessionalCardProps {
  professional: ProfessionalResponseDTO;
  cardIndex: number;
  isFavorite: boolean;
  onToggleFavorite: (professionalId: string) => void;
}

export function DiscoverProfessionalCard({
  professional,
  cardIndex,
  isFavorite,
  onToggleFavorite,
}: DiscoverProfessionalCardProps) {
  const headerGradientClass =
    PROFESSIONAL_CARD_GRADIENTS[cardIndex % PROFESSIONAL_CARD_GRADIENTS.length];
  const avatarInitials = getPersonDisplayInitials(professional.displayName);
  const modalitiesCaption = formatModalitiesCaption(professional.modalities);
  const showTopBadge = isTopRatedProfessional(
    professional.averageRating,
    professional.totalReviews,
  );
  const roundedRating = professional.averageRating != null
    ? Math.round(professional.averageRating)
    : null;

  return (
    <li className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${headerGradientClass}`}
      >
        {professional.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar via rota dinâmica
          <img
            src={`/api/profile/avatar/${professional.userId}`}
            alt={professional.displayName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex select-none items-center justify-center">
            <span className="text-6xl font-extrabold text-white/70">{avatarInitials}</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-3 left-3 right-12">
          <p className="text-base font-bold leading-tight text-white drop-shadow-sm">
            {professional.displayName}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
            <MapPin className="size-3 shrink-0" aria-hidden />
            {professional.location.city}
            {modalitiesCaption ? ` · ${modalitiesCaption}` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleFavorite(professional.id)}
          className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all ${
            isFavorite
              ? 'scale-110 bg-rose-500 text-white'
              : 'bg-white/90 text-slate-400 hover:bg-white hover:text-rose-400'
          }`}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            className={`size-3.5 ${isFavorite ? 'fill-white' : ''}`}
            strokeWidth={isFavorite ? 0 : 1.75}
            aria-hidden
          />
        </button>

        {professional.isVerified && (
          <div className="absolute left-3 top-3">
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="size-2.5" aria-hidden />
              Verificado
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          {professional.averageRating != null ? (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {RATING_STAR_SLOTS.map((starSlot) => (
                  <Star
                    key={starSlot}
                    className={`size-3.5 ${
                      roundedRating !== null && starSlot <= roundedRating
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
                ({professional.totalReviews})
              </span>
            </div>
          ) : (
            <span className="text-xs italic text-slate-400">Sem avaliações ainda</span>
          )}
          {showTopBadge && (
            <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
              <Sparkles className="size-2.5" aria-hidden />
              Top
            </span>
          )}
        </div>

        {professional.bio ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {professional.bio}
          </p>
        ) : null}

        {professional.areas.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {professional.areas.slice(0, 3).map((area) => (
              <span
                key={area.id}
                className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
              >
                {area.nome}
              </span>
            ))}
            {professional.areas.length > 3 ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-500">
                +{professional.areas.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {formatSessionPriceRange(
                professional.sessionPrice.min,
                professional.sessionPrice.max,
                professional.sessionPrice.currency,
              )}
              <span className="ml-1 text-xs font-normal text-slate-400">/sessão</span>
            </p>
            {professional.isAcceptingClients ? (
              <p className="mt-0.5 text-[11px] font-medium text-emerald-600">
                ✓ Aceita novos alunos
              </p>
            ) : null}
          </div>
          <Link
            href={`/perfil/${professional.userId}`}
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
          >
            Ver perfil
            <ArrowRight className="size-3" aria-hidden />
          </Link>
        </div>
      </div>
    </li>
  );
}

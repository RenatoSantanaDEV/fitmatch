import { SessionModality } from '../../domain/enums/SessionModality';
import type { ModalityFilter } from './discoverSearchTypes';

export function formatSessionPriceRange(
  minimum: number,
  maximum: number,
  currencyCode: string,
): string {
  try {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
    });
    if (minimum === maximum) return formatter.format(minimum);
    return `${formatter.format(minimum)} – ${formatter.format(maximum)}`;
  } catch {
    return `${minimum} – ${maximum} ${currencyCode}`;
  }
}

export function getPersonDisplayInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function modalityRequiresLocation(modalityFilter: ModalityFilter): boolean {
  return modalityFilter === 'IN_PERSON' || modalityFilter === 'HYBRID';
}

export function formatModalitiesCaption(modalities: SessionModality[]): string | null {
  if (modalities.length === 0) return null;
  const labels = modalities.map((modality) => {
    switch (modality) {
      case SessionModality.ONLINE:
        return 'Online';
      case SessionModality.IN_PERSON:
        return 'Presencial';
      case SessionModality.HYBRID:
        return 'Híbrido';
      default:
        return 'Híbrido';
    }
  });
  return labels.join(' & ');
}

export const RATING_STAR_SLOTS = [1, 2, 3, 4, 5] as const;

export function isTopRatedProfessional(
  averageRating: number | null,
  totalReviews: number,
): boolean {
  return averageRating != null && averageRating >= 4.5 && totalReviews >= 3;
}

import type { Professional as PrismaProfessional } from '@prisma/client';
import { Professional } from '../../../domain/entities/Professional';
import { type Location } from '../../../domain/value-objects/Location';
import { type PriceRange } from '../../../domain/value-objects/PriceRange';
import { SpecializationType } from '../../../domain/enums/SpecializationType';
import { SessionModality } from '../../../domain/enums/SessionModality';

export class ProfessionalMapper {
  static toDomain(raw: PrismaProfessional): Professional {
    const location: Location = {
      street: raw.locationStreet,
      city: raw.locationCity,
      state: raw.locationState,
      country: raw.locationCountry,
      postalCode: raw.locationPostal,
      latitude: raw.locationLat ?? undefined,
      longitude: raw.locationLng ?? undefined,
    };

    const sessionPrice: PriceRange = {
      min: raw.priceMin,
      max: raw.priceMax,
      currency: raw.priceCurrency,
    };

    return {
      id: raw.id,
      userId: raw.userId,
      bio: raw.bio,
      specializations: raw.specializations as SpecializationType[],
      location,
      modalities: raw.modalities as SessionModality[],
      sessionPrice,
      yearsExperience: raw.yearsExperience,
      isVerified: raw.isVerified,
      isAcceptingClients: raw.isAcceptingClients,
      averageRating: raw.averageRating,
      totalReviews: raw.totalReviews,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}

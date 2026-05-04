import type { Professional as PrismaProfessional, ProfessionalArea, AreaAtuacao } from '@prisma/client';
import { Professional } from '../../../domain/entities/Professional';
import { type Location } from '../../../domain/value-objects/Location';
import { type PriceRange } from '../../../domain/value-objects/PriceRange';
import { SessionModality } from '../../../domain/enums/SessionModality';

type ProfessionalWithAreas = PrismaProfessional & {
  areas: (ProfessionalArea & { area: AreaAtuacao })[];
};

export class ProfessionalMapper {
  static toDomain(raw: ProfessionalWithAreas): Professional {
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
      areas: raw.areas.map((pa) => ({
        id: pa.area.id,
        nome: pa.area.nome,
        slug: pa.area.slug,
      })),
      location,
      modalities: raw.modalities as SessionModality[],
      sessionPrice,
      yearsExperience: raw.yearsExperience,
      crefNumber: raw.crefNumber ?? undefined,
      isVerified: raw.isVerified,
      isAcceptingClients: raw.isAcceptingClients,
      averageRating: raw.averageRating,
      totalReviews: raw.totalReviews,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}

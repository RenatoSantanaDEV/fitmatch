import { PrismaClient } from '@prisma/client';
import {
  IProfessionalRepository,
  ProfessionalFilters,
  PaginatedResult,
} from '../../../application/ports/output/IProfessionalRepository';
import { Professional } from '../../../domain/entities/Professional';
import { ProfessionalMapper } from '../mappers/ProfessionalMapper';

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number | null,
  lon2: number | null,
): number | null {
  if (lat2 == null || lon2 == null) return null;
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class PrismaProfessionalRepository implements IProfessionalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Professional | null> {
    const raw = await this.prisma.professional.findUnique({ where: { id } });
    return raw ? ProfessionalMapper.toDomain(raw) : null;
  }

  async findByUserId(userId: string): Promise<Professional | null> {
    const raw = await this.prisma.professional.findUnique({ where: { userId } });
    return raw ? ProfessionalMapper.toDomain(raw) : null;
  }

  async save(
    professional: Omit<Professional, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'totalReviews'>,
  ): Promise<Professional> {
    const raw = await this.prisma.professional.create({
      data: {
        userId: professional.userId,
        bio: professional.bio,
        specializations: professional.specializations,
        modalities: professional.modalities,
        yearsExperience: professional.yearsExperience,
        isVerified: professional.isVerified,
        isAcceptingClients: professional.isAcceptingClients,
        priceMin: professional.sessionPrice.min,
        priceMax: professional.sessionPrice.max,
        priceCurrency: professional.sessionPrice.currency,
        locationStreet: professional.location.street,
        locationCity: professional.location.city,
        locationState: professional.location.state,
        locationCountry: professional.location.country,
        locationPostal: professional.location.postalCode,
        locationLat: professional.location.latitude,
        locationLng: professional.location.longitude,
      },
    });
    return ProfessionalMapper.toDomain(raw);
  }

  async update(id: string, data: Partial<Omit<Professional, 'id' | 'userId' | 'createdAt'>>): Promise<Professional> {
    const raw = await this.prisma.professional.update({
      where: { id },
      data: {
        bio: data.bio,
        specializations: data.specializations,
        modalities: data.modalities,
        yearsExperience: data.yearsExperience,
        isAcceptingClients: data.isAcceptingClients,
        priceMin: data.sessionPrice?.min,
        priceMax: data.sessionPrice?.max,
        priceCurrency: data.sessionPrice?.currency,
        locationStreet: data.location?.street,
        locationCity: data.location?.city,
        locationState: data.location?.state,
        locationCountry: data.location?.country,
        locationPostal: data.location?.postalCode,
        locationLat: data.location?.latitude,
        locationLng: data.location?.longitude,
      },
    });
    return ProfessionalMapper.toDomain(raw);
  }

  async list(filters: ProfessionalFilters): Promise<PaginatedResult<Professional>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.city &&
        (filters.cityInsensitive
          ? { locationCity: { contains: filters.city, mode: 'insensitive' as const } }
          : { locationCity: filters.city })),
      ...(filters.state && { locationState: { equals: filters.state, mode: 'insensitive' as const } }),
      ...(filters.isVerified !== undefined && { isVerified: filters.isVerified }),
      ...(filters.isAcceptingClients !== undefined && { isAcceptingClients: filters.isAcceptingClients }),
      ...(filters.maxPriceInCents && { priceMin: { lte: filters.maxPriceInCents } }),
      ...(filters.specializations?.length && {
        specializations: { hasSome: filters.specializations },
      }),
      ...(filters.modalities?.length && {
        modalities: { hasSome: filters.modalities },
      }),
    };

    const useGeo =
      filters.nearLat != null &&
      filters.nearLng != null &&
      (filters.radiusKm ?? 0) > 0;

    if (useGeo) {
      const takeCap = 400;
      const rows = await this.prisma.professional.findMany({
        where,
        take: takeCap,
        orderBy: { averageRating: 'desc' },
      });
      const lat = filters.nearLat!;
      const lng = filters.nearLng!;
      const radius = filters.radiusKm!;
      const scored = rows
        .map((r) => {
          const d = haversineKm(lat, lng, r.locationLat ?? null, r.locationLng ?? null);
          return { r, d };
        })
        .filter((x) => x.d !== null && x.d <= radius)
        .sort((a, b) => a.d! - b.d!);
      const total = scored.length;
      const slice = scored.slice(skip, skip + limit);
      const data = slice.map((x) => ProfessionalMapper.toDomain(x.r));
      return { data, total, page, limit };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.professional.findMany({ where, skip, take: limit, orderBy: { averageRating: 'desc' } }),
      this.prisma.professional.count({ where }),
    ]);

    return { data: data.map(ProfessionalMapper.toDomain), total, page, limit };
  }

  async updateRating(professionalId: string, average: number, total: number): Promise<void> {
    await this.prisma.professional.update({
      where: { id: professionalId },
      data: { averageRating: average, totalReviews: total },
    });
  }
}

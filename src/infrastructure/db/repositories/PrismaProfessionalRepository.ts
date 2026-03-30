import { PrismaClient } from '@prisma/client';
import {
  IProfessionalRepository,
  ProfessionalFilters,
  PaginatedResult,
} from '../../../application/ports/output/IProfessionalRepository';
import { Professional } from '../../../domain/entities/Professional';
import { ProfessionalMapper } from '../mappers/ProfessionalMapper';

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
      ...(filters.city && { locationCity: filters.city }),
      ...(filters.state && { locationState: filters.state }),
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

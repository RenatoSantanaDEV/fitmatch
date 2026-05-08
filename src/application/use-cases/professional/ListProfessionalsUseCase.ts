import { IProfessionalRepository, PaginatedResult } from '../../ports/output/IProfessionalRepository';
import { IUserRepository } from '../../ports/output/IUserRepository';
import { ListProfessionalsDTO, ProfessionalResponseDTO } from '../../dtos/professional/ProfessionalDTO';

export class ListProfessionalsUseCase {
  constructor(
    private readonly professionalRepo: IProfessionalRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(dto: ListProfessionalsDTO): Promise<PaginatedResult<ProfessionalResponseDTO>> {
    const result = await this.professionalRepo.list({
      city: dto.city,
      cityInsensitive: dto.cityInsensitive,
      state: dto.state,
      nameQuery: dto.nameQuery,
      specializations: dto.specializations,
      modalities: dto.modalities,
      maxPriceInCents: dto.maxPriceInCents,
      nearLat: dto.nearLat,
      nearLng: dto.nearLng,
      radiusKm: dto.radiusKm,
      isAcceptingClients: true,
      page: dto.page ?? 1,
      limit: dto.limit ?? 20,
    });

    const profiles = await this.userRepo.findNamesByIds(result.data.map((p) => p.userId));

    return {
      ...result,
      data: result.data.map((p) => ({
        id: p.id,
        userId: p.userId,
        displayName: profiles.get(p.userId)?.name ?? 'Educador',
        avatarUrl: profiles.get(p.userId)?.avatarUrl ?? null,
        bio: p.bio,
        areas: p.areas,
        location: p.location,
        modalities: p.modalities,
        sessionPrice: p.sessionPrice,
        yearsExperience: p.yearsExperience,
        isVerified: p.isVerified,
        isAcceptingClients: p.isAcceptingClients,
        averageRating: p.averageRating,
        totalReviews: p.totalReviews,
        createdAt: p.createdAt,
      })),
    };
  }
}

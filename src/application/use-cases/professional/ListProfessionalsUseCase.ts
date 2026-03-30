import { IProfessionalRepository, PaginatedResult } from '../../ports/output/IProfessionalRepository';
import { ListProfessionalsDTO, ProfessionalResponseDTO } from '../../dtos/professional/ProfessionalDTO';

export class ListProfessionalsUseCase {
  constructor(private readonly professionalRepo: IProfessionalRepository) {}

  async execute(dto: ListProfessionalsDTO): Promise<PaginatedResult<ProfessionalResponseDTO>> {
    const result = await this.professionalRepo.list({
      city: dto.city,
      state: dto.state,
      specializations: dto.specializations,
      modalities: dto.modalities,
      maxPriceInCents: dto.maxPriceInCents,
      isVerified: true,
      isAcceptingClients: true,
      page: dto.page ?? 1,
      limit: dto.limit ?? 20,
    });

    return {
      ...result,
      data: result.data.map((p) => ({
        id: p.id,
        userId: p.userId,
        bio: p.bio,
        specializations: p.specializations,
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

import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IUserRepository } from '../../ports/output/IUserRepository';
import { ProfessionalResponseDTO } from '../../dtos/professional/ProfessionalDTO';
import { toProfessionalResponseDTO } from '../../dtos/professional/toProfessionalResponseDTO';

export interface ListFeaturedProfessionalsInput {
  limit?: number;
}

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 10;

export class ListFeaturedProfessionalsUseCase {
  constructor(
    private readonly professionalRepo: IProfessionalRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: ListFeaturedProfessionalsInput = {}): Promise<ProfessionalResponseDTO[]> {
    const limit = Math.min(input.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    let featured = await this.professionalRepo.findFeatured(limit);

    // No one is actively boosted right now — fall back to the top-rated
    // professionals so the section never looks empty/broken.
    if (featured.length === 0) {
      const fallback = await this.professionalRepo.list({
        isAcceptingClients: true,
        page: 1,
        limit,
      });
      featured = fallback.data;
    }

    const profiles = await this.userRepo.findNamesByIds(featured.map((p) => p.userId));
    return featured.map((p) => toProfessionalResponseDTO(p, profiles.get(p.userId)));
  }
}

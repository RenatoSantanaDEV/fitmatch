import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IUserRepository } from '../../ports/output/IUserRepository';
import { ProfessionalResponseDTO } from '../../dtos/professional/ProfessionalDTO';
import { toProfessionalResponseDTO } from '../../dtos/professional/toProfessionalResponseDTO';
import { SpecializationType } from '../../../domain/enums/SpecializationType';

export interface ListSimilarProfessionalsInput {
  excludeProfessionalId: string;
  specializationSlugs: string[];
  limit?: number;
}

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 10;

export class ListSimilarProfessionalsUseCase {
  constructor(
    private readonly professionalRepo: IProfessionalRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: ListSimilarProfessionalsInput): Promise<ProfessionalResponseDTO[]> {
    const limit = Math.min(input.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    let candidates = await this.fetchExcludingSelf(input.excludeProfessionalId, {
      specializations: input.specializationSlugs.length > 0 ? (input.specializationSlugs as SpecializationType[]) : undefined,
      limit,
    });

    // Backfill with a broader (unfiltered) search if the specialty didn't yield enough.
    if (candidates.length < limit) {
      const seen = new Set(candidates.map((p) => p.id));
      const broader = await this.fetchExcludingSelf(input.excludeProfessionalId, { limit });
      candidates = [...candidates, ...broader.filter((p) => !seen.has(p.id))].slice(0, limit);
    }

    const profiles = await this.userRepo.findNamesByIds(candidates.map((p) => p.userId));
    return candidates.map((p) => toProfessionalResponseDTO(p, profiles.get(p.userId)));
  }

  private async fetchExcludingSelf(
    excludeProfessionalId: string,
    filters: { specializations?: SpecializationType[]; limit: number },
  ) {
    const result = await this.professionalRepo.list({
      specializations: filters.specializations,
      isAcceptingClients: true,
      page: 1,
      limit: filters.limit + 1, // over-fetch by 1 to account for filtering out self
    });
    return result.data.filter((p) => p.id !== excludeProfessionalId).slice(0, filters.limit);
  }
}

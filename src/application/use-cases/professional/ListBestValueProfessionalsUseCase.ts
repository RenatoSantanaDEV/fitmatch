import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IUserRepository } from '../../ports/output/IUserRepository';
import { ProfessionalResponseDTO } from '../../dtos/professional/ProfessionalDTO';
import { toProfessionalResponseDTO } from '../../dtos/professional/toProfessionalResponseDTO';

export interface ListBestValueProfessionalsInput {
  limit?: number;
}

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 10;

export class ListBestValueProfessionalsUseCase {
  constructor(
    private readonly professionalRepo: IProfessionalRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: ListBestValueProfessionalsInput = {}): Promise<ProfessionalResponseDTO[]> {
    const limit = Math.min(input.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const professionals = await this.professionalRepo.findBestValue(limit);

    if (professionals.length === 0) {
      const fallback = await this.professionalRepo.list({
        isAcceptingClients: true,
        page: 1,
        limit,
      });
      const profiles = await this.userRepo.findNamesByIds(fallback.data.map((p) => p.userId));
      return fallback.data.map((p) => toProfessionalResponseDTO(p, profiles.get(p.userId)));
    }

    const profiles = await this.userRepo.findNamesByIds(professionals.map((p) => p.userId));
    return professionals.map((p) => toProfessionalResponseDTO(p, profiles.get(p.userId)));
  }
}

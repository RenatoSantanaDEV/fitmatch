import { IStudentFavoriteRepository } from '../../ports/output/IStudentFavoriteRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IUserRepository } from '../../ports/output/IUserRepository';
import { ProfessionalResponseDTO } from '../../dtos/professional/ProfessionalDTO';
import { toProfessionalResponseDTO } from '../../dtos/professional/toProfessionalResponseDTO';

export interface ListFavoriteProfessionalsInput {
  studentId: string;
}

export class ListFavoriteProfessionalsUseCase {
  constructor(
    private readonly studentFavoriteRepo: IStudentFavoriteRepository,
    private readonly professionalRepo: IProfessionalRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: ListFavoriteProfessionalsInput): Promise<ProfessionalResponseDTO[]> {
    const professionalIds = await this.studentFavoriteRepo.listProfessionalIds(input.studentId);
    if (professionalIds.length === 0) return [];

    const professionals = await this.professionalRepo.findByIds(professionalIds);
    const profiles = await this.userRepo.findNamesByIds(professionals.map((p) => p.userId));
    return professionals.map((p) => toProfessionalResponseDTO(p, profiles.get(p.userId)));
  }
}

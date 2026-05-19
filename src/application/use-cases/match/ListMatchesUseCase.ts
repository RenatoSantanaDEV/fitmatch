import { IMatchRepository } from '../../ports/output/IMatchRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IUserRepository } from '../../ports/output/IUserRepository';
import { MatchWithProfessionalDTO } from '../../dtos/match/MatchDTO';
import { UserNotFoundError } from '../../../domain/errors/UserErrors';

export interface ListMatchesInput {
  userId?: string;
  studentId?: string;
}

export class ListMatchesUseCase {
  constructor(
    private readonly matchRepo: IMatchRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly professionalRepo: IProfessionalRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: ListMatchesInput): Promise<MatchWithProfessionalDTO[]> {
    const student = input.studentId
      ? await this.studentRepo.findById(input.studentId)
      : input.userId
        ? await this.studentRepo.findByUserId(input.userId)
        : null;

    if (!student) throw new UserNotFoundError(input.userId ?? input.studentId ?? '');

    const matches = await this.matchRepo.findByStudentId(student.id);
    if (matches.length === 0) return [];

    const professionalIds = matches.map((m) => m.professionalId);
    const professionals = await this.professionalRepo.findByIds(professionalIds);
    const proById = new Map(professionals.map((p) => [p.id, p]));

    const userIds = professionals.map((p) => p.userId);
    const namesByUserId = await this.userRepo.findNamesByIds(userIds);

    return matches.map((m) => {
      const pro = proById.get(m.professionalId) ?? null;
      const userData = pro ? namesByUserId.get(pro.userId) : undefined;
      return {
        id: m.id,
        studentId: m.studentId,
        professionalId: m.professionalId,
        score: m.score,
        reasoning: m.reasoning,
        status: m.status,
        requestedAt: m.requestedAt,
        respondedAt: m.respondedAt,
        expiresAt: m.expiresAt,
        professional: pro
          ? {
              id: pro.id,
              userId: pro.userId,
              name: userData?.name ?? 'Profissional',
              bio: pro.bio,
              areas: pro.areas,
              modalities: pro.modalities,
              yearsExperience: pro.yearsExperience,
              averageRating: pro.averageRating,
              totalReviews: pro.totalReviews,
              city: pro.location.city,
              state: pro.location.state,
              priceMin: pro.sessionPrice.min,
              priceMax: pro.sessionPrice.max,
              priceCurrency: pro.sessionPrice.currency,
              isVerified: pro.isVerified,
            }
          : null,
      };
    });
  }
}

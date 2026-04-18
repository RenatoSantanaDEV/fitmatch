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

/**
 * Lists matches for a student (resolved via userId or studentId) and enriches
 * each row with the associated professional + user info so the UI can render
 * names, bios and pricing without additional round trips.
 */
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

    const professionals = await Promise.all(
      matches.map((m) => this.professionalRepo.findById(m.professionalId)),
    );
    const users = await Promise.all(
      professionals.map((p) => (p ? this.userRepo.findById(p.userId) : Promise.resolve(null))),
    );

    return matches.map((m, i) => {
      const pro = professionals[i];
      const user = users[i];
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
              name: user?.name ?? 'Profissional',
              bio: pro.bio,
              specializations: pro.specializations,
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

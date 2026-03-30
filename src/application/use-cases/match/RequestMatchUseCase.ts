import { IMatchRepository } from '../../ports/output/IMatchRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IMatchingPort } from '../../ports/output/IMatchingPort';
import { INotificationPort } from '../../ports/output/INotificationPort';
import { RequestMatchDTO, MatchResponseDTO } from '../../dtos/match/MatchDTO';
import { MatchStatus } from '../../../domain/enums/MatchStatus';
import { computeMatchExpiresAt, shouldDisplayMatch } from '../../../domain/rules/matchRules';
import { UserNotFoundError } from '../../../domain/errors/UserErrors';

export class RequestMatchUseCase {
  constructor(
    private readonly matchRepo: IMatchRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly professionalRepo: IProfessionalRepository,
    private readonly matchingPort: IMatchingPort,
    private readonly notificationPort: INotificationPort,
  ) {}

  async execute(userId: string, dto: RequestMatchDTO): Promise<MatchResponseDTO[]> {
    const student = await this.studentRepo.findByUserId(userId);
    if (!student) throw new UserNotFoundError(userId);

    const aiResults = await this.matchingPort.findMatches({
      studentId: student.id,
      fitnessGoals: student.fitnessGoals,
      experienceLevel: student.experienceLevel,
      preferredSpecializations: student.preferredSpecializations,
      preferredModality: student.preferredModality,
      budgetRange: student.budgetRange
        ? { min: student.budgetRange.min, max: student.budgetRange.max, currency: student.budgetRange.currency }
        : undefined,
      location: student.preferredLocation
        ? { city: student.preferredLocation.city, state: student.preferredLocation.state, country: student.preferredLocation.country }
        : undefined,
      maxResults: dto.maxResults ?? 5,
    });

    const now = new Date();
    const savedMatches = await Promise.all(
      aiResults.map(async (result) => {
        const existing = await this.matchRepo.findActiveByStudentAndProfessional(
          student.id,
          result.professionalId,
        );
        if (existing) return null;

        return this.matchRepo.save({
          studentId: student.id,
          professionalId: result.professionalId,
          score: result.score,
          reasoning: result.reasoning,
          aiModelVersion: result.modelVersion,
          status: MatchStatus.PENDING,
          requestedAt: now,
          respondedAt: undefined,
          expiresAt: computeMatchExpiresAt(now),
        });
      }),
    );

    const matches = savedMatches.filter(Boolean) as Awaited<ReturnType<typeof this.matchRepo.save>>[];

    // Notify professionals (fire-and-forget — errors are not critical)
    for (const match of matches) {
      this.notificationPort
        .sendMatchNotification(match.professionalId, student.id)
        .catch(() => {});
    }

    return matches
      .filter((m) => shouldDisplayMatch(m, now))
      .map((m) => ({
        id: m.id,
        studentId: m.studentId,
        professionalId: m.professionalId,
        score: m.score,
        reasoning: m.reasoning,
        status: m.status,
        requestedAt: m.requestedAt,
        respondedAt: m.respondedAt,
        expiresAt: m.expiresAt,
      }));
  }
}

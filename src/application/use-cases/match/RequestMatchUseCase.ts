import { IMatchRepository } from '../../ports/output/IMatchRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import {
  IMatchingPort,
  MatchingCandidate,
  MatchingStudent,
} from '../../ports/output/IMatchingPort';
import { INotificationPort } from '../../ports/output/INotificationPort';
import { RequestMatchDTO, MatchResponseDTO } from '../../dtos/match/MatchDTO';
import { MatchStatus } from '../../../domain/enums/MatchStatus';
import { computeMatchExpiresAt, shouldDisplayMatch } from '../../../domain/rules/matchRules';
import { prefilterCandidates } from '../../../domain/rules/matchingRules';
import { UserNotFoundError } from '../../../domain/errors/UserErrors';
import { Student } from '../../../domain/entities/Student';
import { Professional } from '../../../domain/entities/Professional';

const RETRIEVAL_POOL_SIZE = 50;

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

    // 1. Retrieval: pull a broad pool of accepting professionals from the DB.
    const pool = await this.professionalRepo.list({
      isAcceptingClients: true,
      limit: RETRIEVAL_POOL_SIZE,
    });

    // 2. Pure-domain pre-filter (modality, specialization, budget, remote, ...).
    const candidates = prefilterCandidates(student, pool.data);
    if (candidates.length === 0) return [];

    // 3. Rerank + reasoning via the matching port (LLM or heuristic).
    const aiResults = await this.matchingPort.findMatches({
      student: toMatchingStudent(student),
      candidates: candidates.map(toMatchingCandidate),
      maxResults: dto.maxResults ?? 5,
    });

    // 4. Persist (dedup against active matches).
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

    const matches = savedMatches.filter(
      (m): m is Awaited<ReturnType<typeof this.matchRepo.save>> => m !== null,
    );

    // 5. Notify professionals (fire-and-forget — errors are not critical).
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

function toMatchingStudent(student: Student): MatchingStudent {
  return {
    id: student.id,
    fitnessGoals: student.fitnessGoals,
    experienceLevel: student.experienceLevel,
    preferredModality: student.preferredModality,
    preferredSpecializations: student.preferredSpecializations,
    budgetRange: student.budgetRange
      ? {
          min: student.budgetRange.min,
          max: student.budgetRange.max,
          currency: student.budgetRange.currency,
        }
      : undefined,
    location: student.preferredLocation
      ? {
          city: student.preferredLocation.city,
          state: student.preferredLocation.state,
          country: student.preferredLocation.country,
        }
      : undefined,
    bio: student.bio,
  };
}

function toMatchingCandidate(professional: Professional): MatchingCandidate {
  return {
    professionalId: professional.id,
    bio: professional.bio,
    areaSlugs: professional.areas.map((a) => a.slug),
    modalities: professional.modalities,
    yearsExperience: professional.yearsExperience,
    averageRating: professional.averageRating,
    totalReviews: professional.totalReviews,
    priceRange: {
      min: professional.sessionPrice.min,
      max: professional.sessionPrice.max,
      currency: professional.sessionPrice.currency,
    },
    city: professional.location.city,
    state: professional.location.state,
    country: professional.location.country,
    isVerified: professional.isVerified,
  };
}

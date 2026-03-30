import { IReviewRepository } from '../../ports/output/IReviewRepository';
import { ISessionRepository } from '../../ports/output/ISessionRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { SubmitReviewDTO, ReviewResponseDTO } from '../../dtos/review/ReviewDTO';
import { assertSessionIsCompleted, assertStudentOwnsSession } from '../../../domain/rules/reviewRules';
import { ReviewAlreadyExistsError } from '../../../domain/errors/ReviewErrors';
import { SessionNotFoundError } from '../../../domain/errors/SessionErrors';

export class SubmitReviewUseCase {
  constructor(
    private readonly reviewRepo: IReviewRepository,
    private readonly sessionRepo: ISessionRepository,
    private readonly professionalRepo: IProfessionalRepository,
  ) {}

  async execute(studentId: string, dto: SubmitReviewDTO): Promise<ReviewResponseDTO> {
    const session = await this.sessionRepo.findById(dto.sessionId);
    if (!session) throw new SessionNotFoundError(dto.sessionId);

    assertSessionIsCompleted(session);
    assertStudentOwnsSession(session, studentId);

    const existing = await this.reviewRepo.findBySessionId(dto.sessionId);
    if (existing) throw new ReviewAlreadyExistsError(dto.sessionId);

    const review = await this.reviewRepo.save({
      sessionId: dto.sessionId,
      studentId,
      professionalId: session.professionalId,
      rating: { value: dto.rating },
      comment: dto.comment,
      isPublic: dto.isPublic ?? true,
    });

    const { average, total } = await this.reviewRepo.computeAverageForProfessional(session.professionalId);
    await this.professionalRepo.updateRating(session.professionalId, average, total);

    return {
      id: review.id,
      sessionId: review.sessionId,
      studentId: review.studentId,
      professionalId: review.professionalId,
      rating: review.rating.value,
      comment: review.comment,
      isPublic: review.isPublic,
      createdAt: review.createdAt,
    };
  }
}

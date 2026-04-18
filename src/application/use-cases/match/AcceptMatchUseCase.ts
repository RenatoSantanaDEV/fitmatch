import { IMatchRepository } from '../../ports/output/IMatchRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { MatchResponseDTO } from '../../dtos/match/MatchDTO';
import { MatchStatus } from '../../../domain/enums/MatchStatus';
import { assertMatchIsRespondable } from '../../../domain/rules/matchRules';
import { MatchNotFoundError, MatchUnauthorizedError } from '../../../domain/errors/MatchErrors';

export class AcceptMatchUseCase {
  constructor(
    private readonly matchRepo: IMatchRepository,
    private readonly studentRepo: IStudentRepository,
  ) {}

  async execute(matchId: string, userId: string): Promise<MatchResponseDTO> {
    const match = await this.matchRepo.findById(matchId);
    if (!match) throw new MatchNotFoundError(matchId);

    const student = await this.studentRepo.findByUserId(userId);
    if (!student || student.id !== match.studentId) throw new MatchUnauthorizedError(matchId);

    assertMatchIsRespondable(match);

    const updated = await this.matchRepo.updateStatus(matchId, MatchStatus.ACCEPTED, new Date());

    return {
      id: updated.id,
      studentId: updated.studentId,
      professionalId: updated.professionalId,
      score: updated.score,
      reasoning: updated.reasoning,
      status: updated.status,
      requestedAt: updated.requestedAt,
      respondedAt: updated.respondedAt,
      expiresAt: updated.expiresAt,
    };
  }
}

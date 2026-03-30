import { ISessionRepository } from '../../ports/output/ISessionRepository';
import { SessionStatus } from '../../../domain/enums/SessionStatus';
import { SessionNotFoundError } from '../../../domain/errors/SessionErrors';
import { DomainError } from '../../../domain/errors/DomainError';

export class CompleteSessionUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(sessionId: string, professionalId: string): Promise<void> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new SessionNotFoundError(sessionId);

    if (session.professionalId !== professionalId) {
      throw new DomainError('Only the professional of this session can mark it as completed');
    }

    if (session.status !== SessionStatus.CONFIRMED) {
      throw new DomainError(`Session must be CONFIRMED to be completed (current: ${session.status})`);
    }

    await this.sessionRepo.updateStatus(sessionId, SessionStatus.COMPLETED, {
      completedAt: new Date(),
    });
  }
}

import { ISessionRepository } from '../../ports/output/ISessionRepository';
import { INotificationPort } from '../../ports/output/INotificationPort';
import { SessionStatus } from '../../../domain/enums/SessionStatus';
import {
  assertSessionIsCancellable,
  assertCancellationReasonIfWithin24h,
} from '../../../domain/rules/sessionRules';
import { SessionNotFoundError } from '../../../domain/errors/SessionErrors';

type CancelledBy = 'STUDENT' | 'PROFESSIONAL' | 'SYSTEM';

export class CancelSessionUseCase {
  constructor(
    private readonly sessionRepo: ISessionRepository,
    private readonly notificationPort: INotificationPort,
  ) {}

  async execute(
    sessionId: string,
    cancelledBy: CancelledBy,
    recipientUserId: string,
    reason?: string,
  ): Promise<void> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw new SessionNotFoundError(sessionId);

    assertSessionIsCancellable(session);
    assertCancellationReasonIfWithin24h(session, reason);

    await this.sessionRepo.updateStatus(sessionId, SessionStatus.CANCELLED, {
      cancellationReason: reason,
      cancelledBy,
    });

    this.notificationPort
      .sendSessionCancellation(sessionId, recipientUserId, reason)
      .catch(() => {});
  }
}

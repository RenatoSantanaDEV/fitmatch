import { Session } from '../entities/Session';
import { SessionStatus } from '../enums/SessionStatus';
import {
  SessionNotCancellableError,
  CancellationReasonRequiredError,
} from '../errors/SessionErrors';

const HOURS_24_MS = 24 * 60 * 60 * 1000;

export function assertSessionIsCancellable(session: Session): void {
  const cancellable: SessionStatus[] = [SessionStatus.PENDING, SessionStatus.CONFIRMED];
  if (!cancellable.includes(session.status)) {
    throw new SessionNotCancellableError(session.id, session.status);
  }
}

export function assertCancellationReasonIfWithin24h(
  session: Session,
  reason: string | undefined,
  now: Date = new Date(),
): void {
  const timeUntilStart = session.timeSlot.startTime.getTime() - now.getTime();
  if (timeUntilStart <= HOURS_24_MS && !reason) {
    throw new CancellationReasonRequiredError();
  }
}

export function isSessionCompletable(session: Session): boolean {
  return session.status === SessionStatus.CONFIRMED;
}

import { Session } from '../entities/Session';
import { SessionStatus } from '../enums/SessionStatus';
import { SessionNotCompletedError } from '../errors/SessionErrors';
import { UnauthorizedReviewError } from '../errors/ReviewErrors';

export function assertSessionIsCompleted(session: Session): void {
  if (session.status !== SessionStatus.COMPLETED) {
    throw new SessionNotCompletedError(session.id);
  }
}

export function assertStudentOwnsSession(session: Session, studentId: string): void {
  if (session.studentId !== studentId) {
    throw new UnauthorizedReviewError();
  }
}

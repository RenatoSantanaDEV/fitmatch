import { DomainError } from './DomainError';

export class SessionNotFoundError extends DomainError {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`);
    this.name = 'SessionNotFoundError';
  }
}

export class SessionNotCancellableError extends DomainError {
  constructor(sessionId: string, status: string) {
    super(`Session ${sessionId} cannot be cancelled (current status: ${status})`);
    this.name = 'SessionNotCancellableError';
  }
}

export class SessionNotCompletedError extends DomainError {
  constructor(sessionId: string) {
    super(`Session ${sessionId} is not completed — only completed sessions can be reviewed`);
    this.name = 'SessionNotCompletedError';
  }
}

export class CancellationReasonRequiredError extends DomainError {
  constructor() {
    super('Cancellation reason is required when cancelling within 24 hours of session start');
    this.name = 'CancellationReasonRequiredError';
  }
}

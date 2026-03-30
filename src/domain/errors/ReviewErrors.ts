import { DomainError } from './DomainError';

export class ReviewAlreadyExistsError extends DomainError {
  constructor(sessionId: string) {
    super(`A review for session ${sessionId} already exists`);
    this.name = 'ReviewAlreadyExistsError';
  }
}

export class UnauthorizedReviewError extends DomainError {
  constructor() {
    super('You can only review sessions where you are the student');
    this.name = 'UnauthorizedReviewError';
  }
}

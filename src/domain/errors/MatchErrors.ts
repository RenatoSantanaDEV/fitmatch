import { DomainError } from './DomainError';

export class MatchNotFoundError extends DomainError {
  constructor(matchId: string) {
    super(`Match not found: ${matchId}`);
    this.name = 'MatchNotFoundError';
  }
}

export class MatchAlreadyExistsError extends DomainError {
  constructor(studentId: string, professionalId: string) {
    super(`Active match already exists between student ${studentId} and professional ${professionalId}`);
    this.name = 'MatchAlreadyExistsError';
  }
}

export class MatchExpiredError extends DomainError {
  constructor(matchId: string) {
    super(`Match ${matchId} has expired`);
    this.name = 'MatchExpiredError';
  }
}

export class MatchAlreadyRespondedError extends DomainError {
  constructor(matchId: string) {
    super(`Match ${matchId} has already been accepted or rejected`);
    this.name = 'MatchAlreadyRespondedError';
  }
}

export class MatchUnauthorizedError extends DomainError {
  constructor(matchId: string) {
    super(`Not authorized to respond to match ${matchId}`);
    this.name = 'MatchUnauthorizedError';
  }
}

import { DomainError } from './DomainError';

export class ProfessionalNotFoundError extends DomainError {
  constructor(professionalId: string) {
    super(`Professional not found: ${professionalId}`);
    this.name = 'ProfessionalNotFoundError';
  }
}

export class ProfessionalNotAcceptingClientsError extends DomainError {
  constructor(professionalId: string) {
    super(`Professional ${professionalId} is not accepting new clients`);
    this.name = 'ProfessionalNotAcceptingClientsError';
  }
}

export class ProfessionalNotVerifiedError extends DomainError {
  constructor(professionalId: string) {
    super(`Professional ${professionalId} has not been verified yet`);
    this.name = 'ProfessionalNotVerifiedError';
  }
}

export class NoSpecializationError extends DomainError {
  constructor() {
    super('Professional must have at least one specialization before accepting clients');
    this.name = 'NoSpecializationError';
  }
}

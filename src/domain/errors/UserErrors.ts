import { DomainError } from './DomainError';

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = 'UserNotFoundError';
  }
}

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class UserInactiveError extends DomainError {
  constructor(userId: string) {
    super(`User ${userId} is inactive and cannot perform this action`);
    this.name = 'UserInactiveError';
  }
}

export class InvalidRoleError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRoleError';
  }
}

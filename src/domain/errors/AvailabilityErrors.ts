import { DomainError } from './DomainError';

export class AvailabilityNotFoundError extends DomainError {
  constructor(availabilityId: string) {
    super(`Availability slot not found: ${availabilityId}`);
    this.name = 'AvailabilityNotFoundError';
  }
}

export class AvailabilityAlreadyBookedError extends DomainError {
  constructor(availabilityId: string) {
    super(`Availability slot ${availabilityId} is already booked`);
    this.name = 'AvailabilityAlreadyBookedError';
  }
}

export class AvailabilityOverlapError extends DomainError {
  constructor() {
    super('The availability slot overlaps with an existing slot for this professional');
    this.name = 'AvailabilityOverlapError';
  }
}

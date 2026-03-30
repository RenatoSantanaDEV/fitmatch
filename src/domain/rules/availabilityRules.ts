import { Availability } from '../entities/Availability';
import { AvailabilityRecurrence } from '../enums/AvailabilityRecurrence';
import {
  AvailabilityAlreadyBookedError,
  AvailabilityOverlapError,
} from '../errors/AvailabilityErrors';
import { DomainError } from '../errors/DomainError';

export function assertSlotIsAvailable(slot: Availability): void {
  if (slot.isBooked) {
    throw new AvailabilityAlreadyBookedError(slot.id);
  }
  if (slot.validUntil && new Date() > slot.validUntil) {
    throw new DomainError(`Availability slot ${slot.id} has expired`);
  }
}

export function assertWeeklyHasDayOfWeek(slot: Pick<Availability, 'recurrence' | 'dayOfWeek'>): void {
  if (slot.recurrence === AvailabilityRecurrence.WEEKLY && slot.dayOfWeek === undefined) {
    throw new DomainError('Weekly availability must specify dayOfWeek');
  }
}

export function assertNoOverlap(
  existing: Availability[],
  newStart: Date,
  newEnd: Date,
): void {
  const hasOverlap = existing.some((slot) => {
    const existingStart = slot.timeSlot.startTime.getTime();
    const existingEnd = slot.timeSlot.endTime.getTime();
    const newStartMs = newStart.getTime();
    const newEndMs = newEnd.getTime();
    return newStartMs < existingEnd && newEndMs > existingStart;
  });

  if (hasOverlap) {
    throw new AvailabilityOverlapError();
  }
}

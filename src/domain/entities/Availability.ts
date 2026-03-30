import { type TimeSlot } from '../value-objects/TimeSlot';
import { AvailabilityRecurrence } from '../enums/AvailabilityRecurrence';

export interface Availability {
  readonly id: string;
  readonly professionalId: string;
  readonly dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  readonly timeSlot: TimeSlot;
  readonly recurrence: AvailabilityRecurrence;
  readonly isBooked: boolean;
  readonly validFrom: Date;
  readonly validUntil?: Date;
}

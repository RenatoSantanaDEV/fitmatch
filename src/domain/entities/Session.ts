import { type TimeSlot } from '../value-objects/TimeSlot';
import { type Location } from '../value-objects/Location';
import { SessionStatus } from '../enums/SessionStatus';
import { SessionModality } from '../enums/SessionModality';

export interface Session {
  readonly id: string;
  readonly studentId: string;
  readonly professionalId: string;
  readonly matchId?: string;
  readonly availabilityId: string;
  readonly timeSlot: TimeSlot;
  readonly modality: SessionModality;
  readonly location?: Location;
  readonly onlineMeetingUrl?: string;
  readonly status: SessionStatus;
  readonly priceInCents: number;
  readonly currency: string;
  readonly cancellationReason?: string;
  readonly cancelledBy?: 'STUDENT' | 'PROFESSIONAL' | 'SYSTEM';
  readonly completedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

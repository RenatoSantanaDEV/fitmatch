import { type Location } from '../../../domain/value-objects/Location';
import { SessionModality } from '../../../domain/enums/SessionModality';
import { SessionStatus } from '../../../domain/enums/SessionStatus';

export interface BookSessionDTO {
  professionalId: string;
  availabilityId: string;
  modality: SessionModality;
  matchId?: string;
  locationOverride?: Location;
  onlineMeetingUrl?: string;
}

export interface SessionResponseDTO {
  id: string;
  studentId: string;
  professionalId: string;
  matchId?: string;
  availabilityId: string;
  startTime: Date;
  endTime: Date;
  modality: SessionModality;
  location?: Location;
  onlineMeetingUrl?: string;
  status: SessionStatus;
  priceInCents: number;
  currency: string;
  cancellationReason?: string;
  completedAt?: Date;
  createdAt: Date;
}

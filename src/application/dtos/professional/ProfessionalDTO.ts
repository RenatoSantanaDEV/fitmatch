import { type Location } from '../../../domain/value-objects/Location';
import { type PriceRange } from '../../../domain/value-objects/PriceRange';
import { SpecializationType } from '../../../domain/enums/SpecializationType';
import { SessionModality } from '../../../domain/enums/SessionModality';

export interface CreateProfessionalDTO {
  bio: string;
  specializations: SpecializationType[];
  modalities: SessionModality[];
  location: Location;
  sessionPrice: PriceRange;
  yearsExperience: number;
}

export interface UpdateProfessionalDTO {
  bio?: string;
  specializations?: SpecializationType[];
  modalities?: SessionModality[];
  location?: Location;
  sessionPrice?: PriceRange;
  yearsExperience?: number;
  isAcceptingClients?: boolean;
}

export interface ProfessionalResponseDTO {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  specializations: SpecializationType[];
  location: Location;
  modalities: SessionModality[];
  sessionPrice: PriceRange;
  yearsExperience: number;
  isVerified: boolean;
  isAcceptingClients: boolean;
  averageRating: number | null;
  totalReviews: number;
  createdAt: Date;
}

export interface ListProfessionalsDTO {
  city?: string;
  state?: string;
  cityInsensitive?: boolean;
  specializations?: SpecializationType[];
  modalities?: SessionModality[];
  maxPriceInCents?: number;
  nearLat?: number;
  nearLng?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

export interface AddCertificationDTO {
  name: string;
  issuingBody: string;
  issueDate: string; // ISO date string
  expiryDate?: string;
  documentUrl?: string;
}

export interface SetAvailabilityDTO {
  dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string; // ISO datetime string
  endTime: string;
  recurrence: 'ONCE' | 'WEEKLY';
  validFrom: string;
  validUntil?: string;
}

import { MatchStatus } from '../../../domain/enums/MatchStatus';
import { SessionModality } from '../../../domain/enums/SessionModality';
import { SpecializationType } from '../../../domain/enums/SpecializationType';

export interface RequestMatchDTO {
  maxResults?: number;
}

export interface MatchResponseDTO {
  id: string;
  studentId: string;
  professionalId: string;
  score: number;
  reasoning: string;
  status: MatchStatus;
  requestedAt: Date;
  respondedAt?: Date;
  expiresAt: Date;
}

/**
 * Enriched match DTO used to render the student-facing matches list.
 * Joins the `Match` row with public professional info for display.
 */
export interface MatchWithProfessionalDTO extends MatchResponseDTO {
  professional: {
    id: string;
    name: string;
    bio: string;
    specializations: SpecializationType[];
    modalities: SessionModality[];
    yearsExperience: number;
    averageRating: number | null;
    totalReviews: number;
    city: string;
    state: string;
    priceMin: number;
    priceMax: number;
    priceCurrency: string;
    isVerified: boolean;
  } | null;
}

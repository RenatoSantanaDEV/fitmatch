import { MatchStatus } from '../../../domain/enums/MatchStatus';
import { SessionModality } from '../../../domain/enums/SessionModality';
import { type AreaAtuacao } from '../../../domain/entities/Professional';

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

export interface MatchWithProfessionalDTO extends MatchResponseDTO {
  professional: {
    id: string;
    name: string;
    bio: string;
    areas: AreaAtuacao[];
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

import { type Location } from '../value-objects/Location';
import { type PriceRange } from '../value-objects/PriceRange';
import { SessionModality } from '../enums/SessionModality';
import { BoostTier } from '../enums/BoostTier';

export interface AreaAtuacao {
  readonly id: string;
  readonly nome: string;
  readonly slug: string;
}

export interface Professional {
  readonly id: string;
  readonly userId: string;
  readonly bio: string;
  readonly areas: AreaAtuacao[];
  readonly location: Location;
  readonly modalities: SessionModality[];
  readonly sessionPrice: PriceRange;
  readonly yearsExperience: number;
  readonly crefNumber?: string;
  readonly classDynamics?: string;
  readonly sessionDurationMinutes?: number;
  readonly linkedinUrl?: string;
  readonly instagramUrl?: string;
  readonly facebookUrl?: string;
  readonly websiteUrl?: string;
  readonly isVerified: boolean;
  readonly isAcceptingClients: boolean;
  readonly averageRating: number | null;
  readonly totalReviews: number;
  readonly boostTier: BoostTier | null;
  readonly boostExpiresAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

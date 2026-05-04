import { type Location } from '../value-objects/Location';
import { type PriceRange } from '../value-objects/PriceRange';
import { SessionModality } from '../enums/SessionModality';

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
  readonly isVerified: boolean;
  readonly isAcceptingClients: boolean;
  readonly averageRating: number | null;
  readonly totalReviews: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

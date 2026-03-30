import { type Location } from '../value-objects/Location';
import { type PriceRange } from '../value-objects/PriceRange';
import { SpecializationType } from '../enums/SpecializationType';
import { SessionModality } from '../enums/SessionModality';

export interface Professional {
  readonly id: string;
  readonly userId: string;
  readonly bio: string;
  readonly specializations: SpecializationType[];
  readonly location: Location;
  readonly modalities: SessionModality[];
  readonly sessionPrice: PriceRange;
  readonly yearsExperience: number;
  readonly isVerified: boolean;
  readonly isAcceptingClients: boolean;
  readonly averageRating: number | null;
  readonly totalReviews: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

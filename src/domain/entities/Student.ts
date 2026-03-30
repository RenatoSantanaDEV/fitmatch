import { type Location } from '../value-objects/Location';
import { type PriceRange } from '../value-objects/PriceRange';
import { ExperienceLevel } from '../enums/ExperienceLevel';
import { SessionModality } from '../enums/SessionModality';
import { SpecializationType } from '../enums/SpecializationType';

export interface Student {
  readonly id: string;
  readonly userId: string;
  readonly fitnessGoals: string[];
  readonly experienceLevel: ExperienceLevel;
  readonly preferredModality: SessionModality;
  readonly preferredSpecializations: SpecializationType[];
  readonly preferredLocation?: Location;
  readonly budgetRange?: PriceRange;
  readonly bio?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

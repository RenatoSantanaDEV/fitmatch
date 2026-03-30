import { type Location } from '../../../domain/value-objects/Location';
import { type PriceRange } from '../../../domain/value-objects/PriceRange';
import { ExperienceLevel } from '../../../domain/enums/ExperienceLevel';
import { SessionModality } from '../../../domain/enums/SessionModality';
import { SpecializationType } from '../../../domain/enums/SpecializationType';

export interface CreateStudentDTO {
  fitnessGoals: string[];
  experienceLevel: ExperienceLevel;
  preferredModality: SessionModality;
  preferredSpecializations: SpecializationType[];
  preferredLocation?: Location;
  budgetRange?: PriceRange;
  bio?: string;
}

export interface UpdateStudentDTO {
  fitnessGoals?: string[];
  experienceLevel?: ExperienceLevel;
  preferredModality?: SessionModality;
  preferredSpecializations?: SpecializationType[];
  preferredLocation?: Location;
  budgetRange?: PriceRange;
  bio?: string;
}

export interface StudentResponseDTO {
  id: string;
  userId: string;
  fitnessGoals: string[];
  experienceLevel: ExperienceLevel;
  preferredModality: SessionModality;
  preferredSpecializations: SpecializationType[];
  preferredLocation?: Location;
  budgetRange?: PriceRange;
  bio?: string;
  createdAt: Date;
}

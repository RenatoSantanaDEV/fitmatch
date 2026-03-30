import { ExperienceLevel } from '../../../domain/enums/ExperienceLevel';
import { SessionModality } from '../../../domain/enums/SessionModality';
import { SpecializationType } from '../../../domain/enums/SpecializationType';

export interface MatchingRequest {
  studentId: string;
  fitnessGoals: string[];
  experienceLevel: ExperienceLevel;
  preferredSpecializations: SpecializationType[];
  preferredModality: SessionModality;
  budgetRange?: {
    min: number;
    max: number;
    currency: string;
  };
  location?: {
    city: string;
    state: string;
    country: string;
  };
  maxResults: number;
}

export interface MatchingResult {
  professionalId: string;
  score: number; // 0.0 – 1.0
  reasoning: string;
  modelVersion: string;
}

export interface IMatchingPort {
  findMatches(request: MatchingRequest): Promise<MatchingResult[]>;
}

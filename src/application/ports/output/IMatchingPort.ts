import { ExperienceLevel } from '../../../domain/enums/ExperienceLevel';
import { SessionModality } from '../../../domain/enums/SessionModality';
import { SpecializationType } from '../../../domain/enums/SpecializationType';

export interface MatchingStudent {
  id: string;
  fitnessGoals: string[];
  experienceLevel: ExperienceLevel;
  preferredModality: SessionModality;
  preferredSpecializations: SpecializationType[];
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
  bio?: string;
}

export interface MatchingCandidate {
  professionalId: string;
  bio: string;
  areaSlugs: string[];
  modalities: SessionModality[];
  yearsExperience: number;
  averageRating: number | null;
  totalReviews: number;
  priceRange: { min: number; max: number; currency: string };
  city: string;
  state: string;
  country: string;
  isVerified: boolean;
}

export interface MatchingRequest {
  student: MatchingStudent;
  candidates: MatchingCandidate[];
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

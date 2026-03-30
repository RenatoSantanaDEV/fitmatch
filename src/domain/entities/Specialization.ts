import { SpecializationType } from '../enums/SpecializationType';

export interface Specialization {
  readonly id: string;
  readonly professionalId: string;
  readonly type: SpecializationType;
  readonly yearsExperience: number;
  readonly description?: string;
  readonly subSpecializations: string[];
  readonly createdAt: Date;
}

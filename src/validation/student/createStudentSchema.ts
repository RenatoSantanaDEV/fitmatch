import { z } from 'zod';
import { ExperienceLevel } from '../../domain/enums/ExperienceLevel';
import { SessionModality } from '../../domain/enums/SessionModality';
import { SpecializationType } from '../../domain/enums/SpecializationType';
import { locationSchema, priceRangeSchema } from '../shared';

export const createStudentSchema = z.object({
  fitnessGoals: z.array(z.string().min(1)).min(1),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  preferredModality: z.nativeEnum(SessionModality),
  preferredSpecializations: z.array(z.nativeEnum(SpecializationType)).min(1),
  preferredLocation: locationSchema.optional(),
  budgetRange: priceRangeSchema.optional(),
  bio: z.string().max(1000).optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

import { z } from 'zod';
import { SpecializationType } from '../../domain/enums/SpecializationType';
import { SessionModality } from '../../domain/enums/SessionModality';
import { locationSchema, priceRangeSchema } from '../shared';

export const createProfessionalSchema = z.object({
  bio: z.string().min(50).max(2000),
  specializations: z.array(z.nativeEnum(SpecializationType)).min(1),
  modalities: z.array(z.nativeEnum(SessionModality)).min(1),
  location: locationSchema,
  sessionPrice: priceRangeSchema,
  yearsExperience: z.number().int().min(0).max(60),
});

export const updateProfessionalSchema = createProfessionalSchema.partial().extend({
  isAcceptingClients: z.boolean().optional(),
});

export type CreateProfessionalInput = z.infer<typeof createProfessionalSchema>;
export type UpdateProfessionalInput = z.infer<typeof updateProfessionalSchema>;

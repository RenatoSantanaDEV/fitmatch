import { SessionModality } from '../../domain/enums/SessionModality';
import { SpecializationType } from '../../domain/enums/SpecializationType';
import { z } from 'zod';

export const updateProfessionalOnboardingSchema = z.object({
  name: z.string().min(2).max(120),
  specializations: z.array(z.nativeEnum(SpecializationType)).min(1).max(24),
  modalities: z.array(z.nativeEnum(SessionModality)).min(1).max(8).optional(),
  bio: z.string().max(2000).optional(),
  phone: z.string().max(30).optional().nullable(),
});

export type UpdateProfessionalOnboardingInput = z.infer<typeof updateProfessionalOnboardingSchema>;

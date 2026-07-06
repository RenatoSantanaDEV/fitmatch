import { z } from 'zod';
import { phoneSchema } from '../shared';

export const updateProfessionalStep2Schema = z.object({
  name: z.string().min(2).max(120).optional(),
  bio: z.string().max(2000).optional(),
  yearsExperience: z.number().int().min(0).max(60).optional(),
  crefNumber: z.string().max(30).optional().nullable(),
  phone: phoneSchema.optional().nullable(),
  isAcceptingClients: z.boolean().optional(),
  classDynamics: z.string().max(2000).optional().nullable(),
  sessionDurationMinutes: z.number().int().min(15).max(240).optional().nullable(),
});

export type UpdateProfessionalStep2Input = z.infer<typeof updateProfessionalStep2Schema>;

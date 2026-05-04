import { z } from 'zod';

export const updateProfessionalStep2Schema = z.object({
  name: z.string().min(2).max(120),
  bio: z.string().max(2000).optional(),
  yearsExperience: z.number().int().min(0).max(60),
  crefNumber: z.string().max(30).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
});

export type UpdateProfessionalStep2Input = z.infer<typeof updateProfessionalStep2Schema>;

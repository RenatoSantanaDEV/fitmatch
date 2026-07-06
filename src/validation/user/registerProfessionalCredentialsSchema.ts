import { z } from 'zod';
import { phoneSchema } from '../shared';

export const registerProfessionalCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
});

export type RegisterProfessionalCredentialsInput = z.infer<typeof registerProfessionalCredentialsSchema>;

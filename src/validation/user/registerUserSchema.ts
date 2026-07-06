import { z } from 'zod';
import { UserRole } from '../../domain/enums/UserRole';
import { phoneSchema } from '../shared';

export const registerUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8),
  role: z.enum([UserRole.STUDENT, UserRole.PROFESSIONAL]),
  phone: phoneSchema.optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

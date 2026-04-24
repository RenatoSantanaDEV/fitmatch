import { z } from 'zod';

export const registerStudentAccountSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export type RegisterStudentAccountInput = z.infer<typeof registerStudentAccountSchema>;

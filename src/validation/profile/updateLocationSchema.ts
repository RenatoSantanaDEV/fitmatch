import { z } from 'zod';

export const geocodeLocationBodySchema = z.object({
  street: z.string().min(1).max(400),
  city: z.string().min(1).max(120),
  state: z.string().min(1).max(4),
  country: z.string().min(1).max(80).default('Brasil'),
  postalCode: z.string().max(20).optional(),
});

const cepDigits = z
  .string()
  .min(1, 'Informe o CEP.')
  .transform((s) => s.replace(/\D/g, '').slice(0, 8))
  .refine((s) => s.length === 8, 'CEP deve ter 8 dígitos.');

export const updateProfileLocationBodySchema = z.object({
  street: z.string().min(1).max(400),
  city: z.string().min(1).max(120),
  state: z.string().min(1).max(4),
  country: z.string().min(1).max(80),
  postalCode: cepDigits,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type UpdateProfileLocationBody = z.infer<typeof updateProfileLocationBodySchema>;

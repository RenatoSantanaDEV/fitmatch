import { z } from 'zod';

export const cuidSchema = z.string().cuid2();

export const locationSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(2).max(2),
  country: z.string().min(2).max(3),
  postalCode: z.string().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const priceRangeSchema = z
  .object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
    currency: z.string().length(3),
  })
  .refine((d) => d.min <= d.max, { message: 'min must be less than or equal to max' });

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

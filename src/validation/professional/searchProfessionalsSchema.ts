import { z } from 'zod';

export const searchProfessionalsBodySchema = z.object({
  query: z.string().max(2000).optional().default(''),
  city: z.string().max(120).optional(),
  state: z.string().max(2).optional(),
  lat: z.number().finite().min(-90).max(90).optional(),
  lng: z.number().finite().min(-180).max(180).optional(),
  radiusKm: z.number().finite().min(1).max(500).optional().default(50),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export type SearchProfessionalsBody = z.infer<typeof searchProfessionalsBodySchema>;

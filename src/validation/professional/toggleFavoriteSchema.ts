import { z } from 'zod';

export const toggleFavoriteBodySchema = z.object({
  professionalId: z.string().min(1),
});

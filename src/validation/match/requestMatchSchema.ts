import { z } from 'zod';

export const requestMatchSchema = z.object({
  maxResults: z.number().int().min(1).max(10).default(5),
});

export type RequestMatchInput = z.infer<typeof requestMatchSchema>;

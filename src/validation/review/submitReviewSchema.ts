import { z } from 'zod';
import { cuidSchema } from '../shared';

export const submitReviewSchema = z.object({
  sessionId: cuidSchema,
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  comment: z.string().max(2000).optional(),
  isPublic: z.boolean().default(true),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;

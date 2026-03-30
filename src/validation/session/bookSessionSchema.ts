import { z } from 'zod';
import { SessionModality } from '../../domain/enums/SessionModality';
import { locationSchema, cuidSchema } from '../shared';

export const bookSessionSchema = z.object({
  professionalId: cuidSchema,
  availabilityId: cuidSchema,
  modality: z.nativeEnum(SessionModality),
  matchId: cuidSchema.optional(),
  locationOverride: locationSchema.optional(),
  onlineMeetingUrl: z.string().url().optional(),
});

export type BookSessionInput = z.infer<typeof bookSessionSchema>;

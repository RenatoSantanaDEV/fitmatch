import { SessionModality } from '../../domain/enums/SessionModality';
import { z } from 'zod';

export const updateProfessionalStep3Schema = z.object({
  areaIds: z.array(z.string().cuid()).min(1).max(24),
  modalities: z.array(z.nativeEnum(SessionModality)).min(1).max(8),
  locationCity: z.string().max(100).optional(),
  locationState: z.string().max(50).optional(),
  priceMin: z.number().int().min(0).max(100000).optional(),
  priceMax: z.number().int().min(0).max(100000).optional(),
});

export type UpdateProfessionalStep3Input = z.infer<typeof updateProfessionalStep3Schema>;


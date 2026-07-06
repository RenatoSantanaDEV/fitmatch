import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .max(300, 'URL deve ter no máximo 300 caracteres.')
  .url('Informe uma URL válida (ex.: https://…).')
  .optional()
  .nullable();

export const updateProfessionalSocialLinksSchema = z.object({
  linkedinUrl: optionalUrl,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  websiteUrl: optionalUrl,
});

export type UpdateProfessionalSocialLinksInput = z.infer<typeof updateProfessionalSocialLinksSchema>;

import { Professional } from '../../../domain/entities/Professional';
import { ProfessionalResponseDTO } from './ProfessionalDTO';

export function toProfessionalResponseDTO(
  professional: Professional,
  profile?: { name: string; avatarUrl: string | null },
): ProfessionalResponseDTO {
  return {
    id: professional.id,
    userId: professional.userId,
    displayName: profile?.name ?? 'Educador',
    avatarUrl: profile?.avatarUrl ?? null,
    bio: professional.bio,
    areas: professional.areas,
    location: professional.location,
    modalities: professional.modalities,
    sessionPrice: professional.sessionPrice,
    yearsExperience: professional.yearsExperience,
    isVerified: professional.isVerified,
    isAcceptingClients: professional.isAcceptingClients,
    averageRating: professional.averageRating,
    totalReviews: professional.totalReviews,
    isBoosted: !!professional.boostExpiresAt && professional.boostExpiresAt > new Date(),
    boostTier: (professional.boostTier as 'BASICO' | 'PLUS' | 'PREMIUM' | null) ?? null,
    boostExpiresAt: professional.boostExpiresAt ?? null,
    createdAt: professional.createdAt,
  };
}

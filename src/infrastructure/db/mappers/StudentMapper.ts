import type { Student as PrismaStudent } from '@prisma/client';
import { Student } from '../../../domain/entities/Student';
import { type Location } from '../../../domain/value-objects/Location';
import { type PriceRange } from '../../../domain/value-objects/PriceRange';
import { ExperienceLevel } from '../../../domain/enums/ExperienceLevel';
import { SessionModality } from '../../../domain/enums/SessionModality';
import { SpecializationType } from '../../../domain/enums/SpecializationType';

export class StudentMapper {
  static toDomain(raw: PrismaStudent): Student {
    const preferredLocation: Location | undefined =
      raw.locationCity
        ? {
            street: raw.locationStreet ?? '',
            city: raw.locationCity,
            state: raw.locationState ?? '',
            country: raw.locationCountry ?? '',
            postalCode: raw.locationPostal ?? '',
            latitude: raw.locationLat ?? undefined,
            longitude: raw.locationLng ?? undefined,
          }
        : undefined;

    const budgetRange: PriceRange | undefined =
      raw.budgetMin !== null && raw.budgetMax !== null
        ? { min: raw.budgetMin!, max: raw.budgetMax!, currency: raw.budgetCurrency ?? 'BRL' }
        : undefined;

    return {
      id: raw.id,
      userId: raw.userId,
      fitnessGoals: raw.fitnessGoals,
      experienceLevel: raw.experienceLevel as ExperienceLevel,
      preferredModality: raw.preferredModality as SessionModality,
      preferredSpecializations: raw.preferredSpecializations as SpecializationType[],
      preferredLocation,
      budgetRange,
      bio: raw.bio ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}

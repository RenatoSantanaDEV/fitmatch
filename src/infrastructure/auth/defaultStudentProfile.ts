import {
  ExperienceLevel,
  SessionModality,
  SpecializationType,
  type Prisma,
} from '@prisma/client';

export function defaultStudentUncheckedCreateInput(
  userId: string,
): Prisma.StudentUncheckedCreateInput {
  return {
    userId,
    fitnessGoals: ['condicionamento geral'],
    experienceLevel: ExperienceLevel.BEGINNER,
    preferredModality: SessionModality.HYBRID,
    preferredSpecializations: [SpecializationType.PERSONAL_TRAINING],
  };
}

import { type NextRequest } from 'next/server';
import { auth } from '../../../../lib/auth';
import { studentRepo, professionalRepo } from '../../../../container';
import { MatchingAdapterFactory } from '../../../../infrastructure/ai/MatchingAdapterFactory';
import { ok, unauthorized, badRequest, handleError } from '../../../../lib/apiResponse';
import type { MatchingCandidate, MatchingStudent } from '../../../../application/ports/output/IMatchingPort';
import type { Student } from '../../../../domain/entities/Student';
import type { Professional } from '../../../../domain/entities/Professional';
import { ExperienceLevel } from '../../../../domain/enums/ExperienceLevel';
import { SessionModality } from '../../../../domain/enums/SessionModality';

const MAX_IDS = 20;
const MAX_RESULTS = 5;

interface FormOverride {
  mainGoal?: string;
  level?: string;
  preferredModality?: string;
  trainerStyle?: string;
  frequency?: string;
  emotionalGoal?: string;
  restrictions?: string;
}

const LEVEL_MAP: Record<string, ExperienceLevel> = {
  iniciante: ExperienceLevel.BEGINNER,
  intermediario: ExperienceLevel.INTERMEDIATE,
  avancado: ExperienceLevel.ADVANCED,
};

const MODALITY_MAP: Record<string, SessionModality> = {
  presencial: SessionModality.IN_PERSON,
  online: SessionModality.ONLINE,
  hibrido: SessionModality.HYBRID,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  let body: { professionalIds?: unknown; formData?: FormOverride };
  try {
    body = (await req.json()) as { professionalIds?: unknown; formData?: FormOverride };
  } catch {
    return badRequest('Corpo da requisição inválido.');
  }

  if (!Array.isArray(body.professionalIds) || body.professionalIds.length === 0) {
    return badRequest('professionalIds deve ser um array não vazio.');
  }

  const ids = (body.professionalIds as unknown[])
    .filter((id): id is string => typeof id === 'string')
    .slice(0, MAX_IDS);

  try {
    const [student, professionals] = await Promise.all([
      studentRepo.findByUserId(session.user.id),
      professionalRepo.findByIds(ids),
    ]);

    if (!student || professionals.length === 0) {
      return ok({ rankings: [] });
    }

    const matchingStudent = applyFormOverride(toMatchingStudent(student), body.formData);

    const adapter = MatchingAdapterFactory.create();
    const results = await adapter.findMatches({
      student: matchingStudent,
      candidates: professionals.map(toMatchingCandidate),
      maxResults: MAX_RESULTS,
    });

    return ok({
      rankings: results.map((r) => ({
        professionalId: r.professionalId,
        score: r.score,
        reasoning: r.reasoning,
      })),
    });
  } catch (err) {
    return handleError(err);
  }
}

function applyFormOverride(base: MatchingStudent, form?: FormOverride): MatchingStudent {
  if (!form) return base;
  const overrides: Partial<MatchingStudent> = {};

  if (form.mainGoal) overrides.fitnessGoals = [form.mainGoal];
  if (form.level && LEVEL_MAP[form.level]) overrides.experienceLevel = LEVEL_MAP[form.level];
  if (form.preferredModality && MODALITY_MAP[form.preferredModality]) {
    overrides.preferredModality = MODALITY_MAP[form.preferredModality];
  }
  if (form.restrictions) {
    overrides.bio = form.restrictions;
  }

  return { ...base, ...overrides };
}

function toMatchingStudent(student: Student): MatchingStudent {
  return {
    id: student.id,
    fitnessGoals: student.fitnessGoals,
    experienceLevel: student.experienceLevel,
    preferredModality: student.preferredModality,
    preferredSpecializations: student.preferredSpecializations,
    budgetRange: student.budgetRange
      ? { min: student.budgetRange.min, max: student.budgetRange.max, currency: student.budgetRange.currency }
      : undefined,
    location: student.preferredLocation
      ? { city: student.preferredLocation.city, state: student.preferredLocation.state, country: student.preferredLocation.country }
      : undefined,
    bio: student.bio,
  };
}

function toMatchingCandidate(professional: Professional): MatchingCandidate {
  return {
    professionalId: professional.id,
    bio: professional.bio,
    areaSlugs: professional.areas.map((a) => a.slug),
    modalities: professional.modalities,
    yearsExperience: professional.yearsExperience,
    averageRating: professional.averageRating,
    totalReviews: professional.totalReviews,
    priceRange: {
      min: professional.sessionPrice.min,
      max: professional.sessionPrice.max,
      currency: professional.sessionPrice.currency,
    },
    city: professional.location.city,
    state: professional.location.state,
    country: professional.location.country,
    isVerified: professional.isVerified,
  };
}

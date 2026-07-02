import { type NextRequest } from 'next/server';
import { auth } from '../../../../lib/auth';
import { studentRepo, professionalRepo, userRepo } from '../../../../container';
import { MatchingAdapterFactory } from '../../../../infrastructure/ai/MatchingAdapterFactory';
import { ok, unauthorized, badRequest, handleError, tooManyRequests } from '../../../../lib/apiResponse';
import { checkRateLimit } from '../../../../lib/rateLimit';
import { toProfessionalResponseDTO } from '../../../../application/dtos/professional/toProfessionalResponseDTO';
import type { MatchingCandidate, MatchingStudent } from '../../../../application/ports/output/IMatchingPort';
import type { Student } from '../../../../domain/entities/Student';
import type { Professional } from '../../../../domain/entities/Professional';
import { ExperienceLevel } from '../../../../domain/enums/ExperienceLevel';
import { SessionModality } from '../../../../domain/enums/SessionModality';
import { SPECIALIZATION_BY_ID } from '../../../../domain/enums/specializationCatalog';
import { isProfessionalEligible, prefilterCandidates } from '../../../../domain/rules/matchingRules';

const MAX_IDS = 20;
const MAX_CANDIDATES = 30;
const MAX_RESULTS = 5;
const MIN_CANDIDATES = 3;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

interface FormOverride {
  mainGoal?: string;
  level?: string;
  specialization?: string;
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

  const rateLimit = checkRateLimit(`rank:${session.user.id}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rateLimit.ok) {
    return tooManyRequests(
      rateLimit.retryAfter,
      `Limite de ranking atingido. Tente novamente em ${Math.ceil(rateLimit.retryAfter / 60)} minuto(s).`,
    );
  }

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

  const specializationOverride = body.formData?.specialization
    ? SPECIALIZATION_BY_ID.get(body.formData.specialization)
    : undefined;

  try {
    const [student, idProfessionals] = await Promise.all([
      studentRepo.findByUserId(session.user.id),
      professionalRepo.findByIds(ids),
    ]);

    if (!student) {
      return ok({ rankings: [] });
    }

    // The page's last text search may not have targeted the specialization chosen
    // in this form (e.g. searching "personal" then picking "Natação" here), so
    // pull a fresh, specialization-scoped candidate pool from the DB directly
    // instead of relying solely on the (possibly unrelated) professionalIds passed in.
    let professionals = idProfessionals;
    if (specializationOverride) {
      const bySpecialization = await professionalRepo.list({
        specializations: [specializationOverride],
        isAcceptingClients: true,
        limit: MAX_CANDIDATES,
      });
      professionals = mergeById(professionals, bySpecialization.data).slice(0, MAX_CANDIDATES);
    }

    // Never let the AI choose from a near-empty pool: top up with a general,
    // top-rated pool so there's always enough breadth to compare against.
    if (professionals.length < MIN_CANDIDATES * 3) {
      const general = await professionalRepo.list({ isAcceptingClients: true, limit: MAX_CANDIDATES });
      professionals = mergeById(professionals, general.data).slice(0, MAX_CANDIDATES);
    }

    if (professionals.length === 0) {
      return ok({ rankings: [], professionals: [] });
    }

    const matchingStudent = applyFormOverride(toMatchingStudent(student), body.formData);

    const studentForFilter: Student = {
      ...student,
      ...(body.formData?.preferredModality && MODALITY_MAP[body.formData.preferredModality]
        ? { preferredModality: MODALITY_MAP[body.formData.preferredModality] }
        : {}),
      ...(specializationOverride ? { preferredSpecializations: [specializationOverride] } : {}),
    };

    // Relaxation ladder: strict criteria first, then progressively drop
    // constraints (budget → specialization → modality/location) so the user
    // always sees good alternatives instead of a blank "no results" screen.
    const { candidates: filtered, relaxed } = relaxUntilEnough(studentForFilter, professionals);

    const adapter = MatchingAdapterFactory.create();
    // Name lookup only depends on `filtered` (known before ranking), so run it
    // alongside the AI call instead of waiting for the (usually slower) LLM round trip.
    const [results, profiles] = await Promise.all([
      adapter.findMatches({
        student: matchingStudent,
        candidates: filtered.map(toMatchingCandidate),
        maxResults: MAX_RESULTS,
      }),
      userRepo.findNamesByIds(filtered.map((p) => p.userId)),
    ]);

    const rankedProfessionals = filtered.filter((p) => results.some((r) => r.professionalId === p.id));

    return ok({
      rankings: results.map((r) => ({
        professionalId: r.professionalId,
        score: r.score,
        reasoning: r.reasoning,
      })),
      professionals: rankedProfessionals.map((p) => toProfessionalResponseDTO(p, profiles.get(p.userId))),
      relaxed,
    });
  } catch (err) {
    return handleError(err);
  }
}

function mergeById(a: Professional[], b: Professional[]): Professional[] {
  const seen = new Set(a.map((p) => p.id));
  return [...a, ...b.filter((p) => !seen.has(p.id))];
}

/**
 * Drops constraints one at a time (budget → specialization → modality/location)
 * until there are enough candidates for the AI to meaningfully compare, or
 * every eligible professional has been included.
 */
function relaxUntilEnough(
  student: Student,
  pool: Professional[],
): { candidates: Professional[]; relaxed: boolean } {
  const strict = prefilterCandidates(student, pool);
  if (strict.length >= MIN_CANDIDATES) return { candidates: strict, relaxed: false };

  let candidates = strict;

  const noBudget: Student = { ...student, budgetRange: undefined };
  candidates = mergeById(candidates, prefilterCandidates(noBudget, pool));

  if (candidates.length < MIN_CANDIDATES) {
    const noSpecialization: Student = { ...noBudget, preferredSpecializations: [] };
    candidates = mergeById(candidates, prefilterCandidates(noSpecialization, pool));
  }

  if (candidates.length < MIN_CANDIDATES) {
    candidates = mergeById(candidates, pool.filter((p) => isProfessionalEligible(p)));
  }

  return { candidates: candidates.slice(0, MAX_CANDIDATES), relaxed: candidates.length > strict.length };
}

function applyFormOverride(base: MatchingStudent, form?: FormOverride): MatchingStudent {
  if (!form) return base;
  const overrides: Partial<MatchingStudent> = {};

  if (form.mainGoal) overrides.fitnessGoals = [form.mainGoal];
  if (form.level && LEVEL_MAP[form.level]) overrides.experienceLevel = LEVEL_MAP[form.level];
  if (form.preferredModality && MODALITY_MAP[form.preferredModality]) {
    overrides.preferredModality = MODALITY_MAP[form.preferredModality];
  }
  const specialization = form.specialization ? SPECIALIZATION_BY_ID.get(form.specialization) : undefined;
  if (specialization) overrides.preferredSpecializations = [specialization];
  if (form.restrictions) {
    const existing = base.bio ? `${base.bio}\n\nRestrições: ${form.restrictions}` : form.restrictions;
    overrides.bio = existing;
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
  const now = new Date();
  const isBoosted = !!professional.boostExpiresAt && professional.boostExpiresAt > now;
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
    boostTier: isBoosted ? (professional.boostTier ?? undefined) : undefined,
  };
}

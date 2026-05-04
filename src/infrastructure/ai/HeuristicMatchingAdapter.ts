import {
  IMatchingPort,
  MatchingCandidate,
  MatchingRequest,
  MatchingResult,
  MatchingStudent,
} from '../../application/ports/output/IMatchingPort';
import { SessionModality } from '../../domain/enums/SessionModality';

/**
 * Deterministic fallback used when no LLM API key is configured
 * (local dev, CI, emergency safety net). Candidates are already
 * pre-filtered; this adapter only produces score + reasoning.
 *
 * Weights mirror the rubric in `matchSystemPrompt.md` so behavior
 * stays comparable across adapters.
 */
export class HeuristicMatchingAdapter implements IMatchingPort {
  static readonly MODEL_VERSION = 'heuristic-v1';

  async findMatches(request: MatchingRequest): Promise<MatchingResult[]> {
    const { student, candidates, maxResults } = request;

    const scored = candidates.map((candidate) => {
      const breakdown = scoreCandidate(student, candidate);
      return {
        professionalId: candidate.professionalId,
        score: breakdown.total,
        reasoning: buildReasoning(student, candidate, breakdown),
        modelVersion: HeuristicMatchingAdapter.MODEL_VERSION,
      };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }
}

interface ScoreBreakdown {
  specialization: number;
  experience: number;
  modality: number;
  budget: number;
  social: number;
  verification: number;
  total: number;
}

function scoreCandidate(student: MatchingStudent, candidate: MatchingCandidate): ScoreBreakdown {
  const specialization = scoreSpecialization(student, candidate);
  const experience = scoreExperience(student, candidate);
  const modality = scoreModality(student, candidate);
  const budget = scoreBudget(student, candidate);
  const social = scoreSocial(candidate);
  const verification = candidate.isVerified ? 1 : 0;

  const total =
    specialization * 0.35 +
    experience * 0.2 +
    modality * 0.15 +
    budget * 0.15 +
    social * 0.1 +
    verification * 0.05;

  // Cap at 0.95 — leaves headroom, matches the LLM rubric.
  return {
    specialization,
    experience,
    modality,
    budget,
    social,
    verification,
    total: Math.min(total, 0.95),
  };
}

function scoreSpecialization(student: MatchingStudent, candidate: MatchingCandidate): number {
  if (student.preferredSpecializations.length === 0) return 0.6;
  const overlap = student.preferredSpecializations.filter((s) =>
    candidate.areaSlugs.includes(s as string),
  ).length;
  if (overlap === 0) return 0;
  const ratio = overlap / student.preferredSpecializations.length;
  return Math.min(1, 0.6 + 0.4 * ratio);
}

function scoreExperience(student: MatchingStudent, candidate: MatchingCandidate): number {
  const years = candidate.yearsExperience;
  switch (student.experienceLevel) {
    case 'BEGINNER':
      // Too much experience is fine but not required; penalize zero.
      if (years === 0) return 0.3;
      if (years < 2) return 0.7;
      return 0.9;
    case 'INTERMEDIATE':
      if (years < 2) return 0.4;
      if (years < 5) return 0.85;
      return 1;
    case 'ADVANCED':
      if (years < 3) return 0.3;
      if (years < 7) return 0.75;
      return 1;
    default:
      return 0.5;
  }
}

function scoreModality(student: MatchingStudent, candidate: MatchingCandidate): number {
  const exactMatch = candidate.modalities.includes(student.preferredModality);
  if (exactMatch) return 1;
  // Otherwise hybrid fallback (pre-filter already guaranteed compatibility).
  if (candidate.modalities.includes(SessionModality.HYBRID)) return 0.8;
  return 0.6;
}

function scoreBudget(student: MatchingStudent, candidate: MatchingCandidate): number {
  if (!student.budgetRange) return 0.7;
  const { min: bMin, max: bMax } = student.budgetRange;
  const { min: pMin, max: pMax } = candidate.priceRange;

  // Fully inside the student budget -> 1.0
  if (pMin >= bMin && pMax <= bMax) return 1;
  // Overlap exists (guaranteed by pre-filter) but extends outside -> partial.
  const overlap = Math.max(0, Math.min(bMax, pMax) - Math.max(bMin, pMin));
  const span = Math.max(1, pMax - pMin);
  return Math.max(0.4, Math.min(1, 0.5 + (overlap / span) * 0.5));
}

function scoreSocial(candidate: MatchingCandidate): number {
  if (candidate.averageRating === null || candidate.totalReviews === 0) return 0.5;
  const ratingScore = Math.max(0, Math.min(1, (candidate.averageRating - 3) / 2));
  const reviewsBoost = Math.min(1, candidate.totalReviews / 30);
  return 0.5 * ratingScore + 0.5 * reviewsBoost;
}

function buildReasoning(
  student: MatchingStudent,
  candidate: MatchingCandidate,
  breakdown: ScoreBreakdown,
): string {
  const goals = student.fitnessGoals.slice(0, 2).join(' e ') || 'seus objetivos';
  const parts: string[] = [];

  if (breakdown.specialization >= 0.8) {
    parts.push(`especializações alinhadas com ${goals}`);
  } else if (breakdown.specialization >= 0.6) {
    parts.push(`perfil parcialmente alinhado com ${goals}`);
  } else {
    parts.push(`perfil generalista para ${goals}`);
  }

  if (breakdown.experience >= 0.85) {
    parts.push(`${candidate.yearsExperience} anos de experiência`);
  }

  if (breakdown.modality === 1) {
    const label = modalityLabel(student.preferredModality);
    parts.push(`atende ${label}`);
  } else if (breakdown.modality >= 0.8) {
    parts.push('modalidade híbrida');
  }

  if (breakdown.budget >= 0.9) {
    parts.push('preço dentro do seu orçamento');
  } else if (breakdown.budget >= 0.6) {
    parts.push('preço próximo do seu orçamento');
  }

  if (candidate.averageRating !== null && candidate.averageRating >= 4.5) {
    parts.push(`avaliação ${candidate.averageRating.toFixed(1)}/${candidate.totalReviews}`);
  }

  if (candidate.isVerified) {
    parts.push('profissional verificado');
  }

  return `Match heurístico: ${parts.join(', ')}.`;
}

function modalityLabel(modality: SessionModality): string {
  switch (modality) {
    case SessionModality.ONLINE:
      return 'online';
    case SessionModality.IN_PERSON:
      return 'presencialmente';
    case SessionModality.HYBRID:
      return 'em formato híbrido';
  }
}

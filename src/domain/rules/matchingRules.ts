import { Professional } from '../entities/Professional';
import { Student } from '../entities/Student';
import { SessionModality } from '../enums/SessionModality';

export interface PrefilterOptions {
  readonly requireVerified?: boolean;
}

export function isProfessionalEligible(
  professional: Professional,
  opts: PrefilterOptions = {},
): boolean {
  if (!professional.isAcceptingClients) return false;
  if (opts.requireVerified && !professional.isVerified) return false;
  if (professional.areas.length === 0) return false;
  return true;
}

/**
 * Modality compatibility.
 *
 * - Student wants ONLINE  -> professional must offer ONLINE or HYBRID. Location irrelevant.
 * - Student wants IN_PERSON -> professional must offer IN_PERSON or HYBRID AND share the city.
 * - Student wants HYBRID   -> any professional modality works; if the professional
 *   cannot do ONLINE at all, the city must match.
 */
export function isModalityCompatible(student: Student, professional: Professional): boolean {
  const proOffersOnline =
    professional.modalities.includes(SessionModality.ONLINE) ||
    professional.modalities.includes(SessionModality.HYBRID);
  const proOffersInPerson =
    professional.modalities.includes(SessionModality.IN_PERSON) ||
    professional.modalities.includes(SessionModality.HYBRID);

  switch (student.preferredModality) {
    case SessionModality.ONLINE:
      return proOffersOnline;

    case SessionModality.IN_PERSON:
      if (!proOffersInPerson) return false;
      return sameCity(student, professional);

    case SessionModality.HYBRID:
      if (proOffersOnline) return true;
      return proOffersInPerson && sameCity(student, professional);

    default:
      return false;
  }
}

function sameCity(student: Student, professional: Professional): boolean {
  if (!student.preferredLocation) return true;
  return (
    normalize(student.preferredLocation.city) === normalize(professional.location.city) &&
    normalize(student.preferredLocation.state) === normalize(professional.location.state)
  );
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function hasSpecializationOverlap(
  student: Student,
  professional: Professional,
): boolean {
  if (student.preferredSpecializations.length === 0) return true;
  return student.preferredSpecializations.some((spec) =>
    professional.areas.some((a) => a.slug === spec),
  );
}

/**
 * Budget compatibility.
 *
 * A match is compatible when the student's budget range intersects the
 * professional's price range. A student without a budget passes.
 */
export function isBudgetCompatible(student: Student, professional: Professional): boolean {
  if (!student.budgetRange) return true;
  if (student.budgetRange.currency !== professional.sessionPrice.currency) {
    // Currency mismatch: we don't convert automatically in the prototype.
    return false;
  }
  return (
    student.budgetRange.max >= professional.sessionPrice.min &&
    student.budgetRange.min <= professional.sessionPrice.max
  );
}

export function prefilterCandidates(
  student: Student,
  professionals: Professional[],
  opts: PrefilterOptions = {},
): Professional[] {
  return professionals.filter(
    (pro) =>
      isProfessionalEligible(pro, opts) &&
      isModalityCompatible(student, pro) &&
      hasSpecializationOverlap(student, pro) &&
      isBudgetCompatible(student, pro),
  );
}

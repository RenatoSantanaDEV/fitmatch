export { DomainError } from './DomainError';
export { UserNotFoundError, UserAlreadyExistsError, UserInactiveError, InvalidRoleError } from './UserErrors';
export {
  ProfessionalNotFoundError,
  ProfessionalNotAcceptingClientsError,
  ProfessionalNotVerifiedError,
  NoSpecializationError,
} from './ProfessionalErrors';
export { MatchNotFoundError, MatchAlreadyExistsError, MatchExpiredError, MatchAlreadyRespondedError } from './MatchErrors';
export {
  SessionNotFoundError,
  SessionNotCancellableError,
  SessionNotCompletedError,
  CancellationReasonRequiredError,
} from './SessionErrors';
export { ReviewAlreadyExistsError, UnauthorizedReviewError } from './ReviewErrors';
export { AvailabilityNotFoundError, AvailabilityAlreadyBookedError, AvailabilityOverlapError } from './AvailabilityErrors';

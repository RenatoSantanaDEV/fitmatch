import { Match } from '../entities/Match';
import { MatchStatus } from '../enums/MatchStatus';
import { MatchExpiredError, MatchAlreadyRespondedError } from '../errors/MatchErrors';

export const MATCH_SCORE_DISPLAY_THRESHOLD = 0.5;
export const MATCH_TTL_DAYS = 7;

export function isMatchExpired(match: Match, now: Date = new Date()): boolean {
  return now > match.expiresAt;
}

export function assertMatchIsRespondable(match: Match, now: Date = new Date()): void {
  if (isMatchExpired(match, now)) {
    throw new MatchExpiredError(match.id);
  }
  if (match.status !== MatchStatus.PENDING) {
    throw new MatchAlreadyRespondedError(match.id);
  }
}

export function shouldDisplayMatch(match: Match, now: Date = new Date()): boolean {
  return !isMatchExpired(match, now) && match.score >= MATCH_SCORE_DISPLAY_THRESHOLD;
}

export function computeMatchExpiresAt(requestedAt: Date): Date {
  const expiresAt = new Date(requestedAt);
  expiresAt.setDate(expiresAt.getDate() + MATCH_TTL_DAYS);
  return expiresAt;
}

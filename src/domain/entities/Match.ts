import { MatchStatus } from '../enums/MatchStatus';

export interface Match {
  readonly id: string;
  readonly studentId: string;
  readonly professionalId: string;
  readonly score: number;
  readonly reasoning: string;
  readonly aiModelVersion: string;
  readonly status: MatchStatus;
  readonly requestedAt: Date;
  readonly respondedAt?: Date;
  readonly expiresAt: Date;
}

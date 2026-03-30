import { MatchStatus } from '../../../domain/enums/MatchStatus';

export interface RequestMatchDTO {
  maxResults?: number;
}

export interface MatchResponseDTO {
  id: string;
  studentId: string;
  professionalId: string;
  score: number;
  reasoning: string;
  status: MatchStatus;
  requestedAt: Date;
  respondedAt?: Date;
  expiresAt: Date;
}

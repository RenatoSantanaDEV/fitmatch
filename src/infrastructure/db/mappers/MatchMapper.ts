import type { Match as PrismaMatch } from '@prisma/client';
import { Match } from '../../../domain/entities/Match';
import { MatchStatus } from '../../../domain/enums/MatchStatus';

export class MatchMapper {
  static toDomain(raw: PrismaMatch): Match {
    return {
      id: raw.id,
      studentId: raw.studentId,
      professionalId: raw.professionalId,
      score: raw.score,
      reasoning: raw.reasoning,
      aiModelVersion: raw.aiModelVersion,
      status: raw.status as MatchStatus,
      requestedAt: raw.requestedAt,
      respondedAt: raw.respondedAt ?? undefined,
      expiresAt: raw.expiresAt,
    };
  }
}

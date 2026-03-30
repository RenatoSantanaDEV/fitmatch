import type { Review as PrismaReview } from '@prisma/client';
import { Review } from '../../../domain/entities/Review';
import { type Rating } from '../../../domain/value-objects/Rating';

export class ReviewMapper {
  static toDomain(raw: PrismaReview): Review {
    return {
      id: raw.id,
      sessionId: raw.sessionId,
      studentId: raw.studentId,
      professionalId: raw.professionalId,
      rating: { value: raw.rating as Rating['value'] },
      comment: raw.comment ?? undefined,
      isPublic: raw.isPublic,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}

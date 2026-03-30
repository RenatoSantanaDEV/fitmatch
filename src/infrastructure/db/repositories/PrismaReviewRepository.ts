import { PrismaClient } from '@prisma/client';
import { IReviewRepository } from '../../../application/ports/output/IReviewRepository';
import { Review } from '../../../domain/entities/Review';
import { ReviewMapper } from '../mappers/ReviewMapper';

export class PrismaReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySessionId(sessionId: string): Promise<Review | null> {
    const raw = await this.prisma.review.findUnique({ where: { sessionId } });
    return raw ? ReviewMapper.toDomain(raw) : null;
  }

  async findByProfessionalId(professionalId: string): Promise<Review[]> {
    const rows = await this.prisma.review.findMany({
      where: { professionalId, isPublic: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(ReviewMapper.toDomain);
  }

  async save(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    const raw = await this.prisma.review.create({
      data: {
        sessionId: review.sessionId,
        studentId: review.studentId,
        professionalId: review.professionalId,
        rating: review.rating.value,
        comment: review.comment ?? null,
        isPublic: review.isPublic,
      },
    });
    return ReviewMapper.toDomain(raw);
  }

  async computeAverageForProfessional(professionalId: string): Promise<{ average: number; total: number }> {
    const result = await this.prisma.review.aggregate({
      where: { professionalId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      average: result._avg.rating ?? 0,
      total: result._count.rating,
    };
  }
}

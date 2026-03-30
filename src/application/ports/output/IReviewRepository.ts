import { Review } from '../../../domain/entities/Review';

export interface IReviewRepository {
  findBySessionId(sessionId: string): Promise<Review | null>;
  findByProfessionalId(professionalId: string): Promise<Review[]>;
  save(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review>;
  computeAverageForProfessional(professionalId: string): Promise<{ average: number; total: number }>;
}

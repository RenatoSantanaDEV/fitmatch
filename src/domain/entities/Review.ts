import { type Rating } from '../value-objects/Rating';

export interface Review {
  readonly id: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly professionalId: string;
  readonly rating: Rating;
  readonly comment?: string;
  readonly isPublic: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

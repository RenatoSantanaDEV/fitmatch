import { Professional } from '../../../domain/entities/Professional';
import { SpecializationType } from '../../../domain/enums/SpecializationType';
import { SessionModality } from '../../../domain/enums/SessionModality';

export interface ProfessionalFilters {
  city?: string;
  cityInsensitive?: boolean;
  state?: string;
  specializations?: SpecializationType[];
  modalities?: SessionModality[];
  isVerified?: boolean;
  isAcceptingClients?: boolean;
  maxPriceInCents?: number;
  nearLat?: number;
  nearLng?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IProfessionalRepository {
  findById(id: string): Promise<Professional | null>;
  findByUserId(userId: string): Promise<Professional | null>;
  save(professional: Omit<Professional, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'totalReviews'>): Promise<Professional>;
  update(id: string, data: Partial<Omit<Professional, 'id' | 'userId' | 'createdAt'>>): Promise<Professional>;
  list(filters: ProfessionalFilters): Promise<PaginatedResult<Professional>>;
  updateRating(professionalId: string, average: number, total: number): Promise<void>;
}

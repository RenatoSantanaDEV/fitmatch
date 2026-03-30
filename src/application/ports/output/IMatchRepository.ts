import { Match } from '../../../domain/entities/Match';
import { MatchStatus } from '../../../domain/enums/MatchStatus';

export interface IMatchRepository {
  findById(id: string): Promise<Match | null>;
  findByStudentId(studentId: string): Promise<Match[]>;
  findActiveByStudentAndProfessional(studentId: string, professionalId: string): Promise<Match | null>;
  save(match: Omit<Match, 'id'>): Promise<Match>;
  saveMany(matches: Omit<Match, 'id'>[]): Promise<Match[]>;
  updateStatus(id: string, status: MatchStatus, respondedAt?: Date): Promise<Match>;
}

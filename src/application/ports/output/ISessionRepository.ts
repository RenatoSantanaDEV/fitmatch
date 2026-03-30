import { Session } from '../../../domain/entities/Session';
import { SessionStatus } from '../../../domain/enums/SessionStatus';

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  findByStudentId(studentId: string): Promise<Session[]>;
  findByProfessionalId(professionalId: string): Promise<Session[]>;
  save(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session>;
  updateStatus(id: string, status: SessionStatus, extra?: Partial<Pick<Session, 'completedAt' | 'cancellationReason' | 'cancelledBy'>>): Promise<Session>;
}

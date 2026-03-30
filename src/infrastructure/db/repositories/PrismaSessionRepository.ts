import { PrismaClient } from '@prisma/client';
import { ISessionRepository } from '../../../application/ports/output/ISessionRepository';
import { Session } from '../../../domain/entities/Session';
import { SessionStatus } from '../../../domain/enums/SessionStatus';
import { SessionMapper } from '../mappers/SessionMapper';

export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Session | null> {
    const raw = await this.prisma.session.findUnique({ where: { id } });
    return raw ? SessionMapper.toDomain(raw) : null;
  }

  async findByStudentId(studentId: string): Promise<Session[]> {
    const rows = await this.prisma.session.findMany({ where: { studentId }, orderBy: { startTime: 'asc' } });
    return rows.map(SessionMapper.toDomain);
  }

  async findByProfessionalId(professionalId: string): Promise<Session[]> {
    const rows = await this.prisma.session.findMany({ where: { professionalId }, orderBy: { startTime: 'asc' } });
    return rows.map(SessionMapper.toDomain);
  }

  async save(session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
    const raw = await this.prisma.session.create({
      data: {
        studentId: session.studentId,
        professionalId: session.professionalId,
        matchId: session.matchId ?? null,
        availabilityId: session.availabilityId,
        startTime: session.timeSlot.startTime,
        endTime: session.timeSlot.endTime,
        modality: session.modality,
        priceInCents: session.priceInCents,
        currency: session.currency,
        status: session.status,
        locationStreet: session.location?.street,
        locationCity: session.location?.city,
        locationState: session.location?.state,
        locationCountry: session.location?.country,
        locationPostal: session.location?.postalCode,
        onlineMeetingUrl: session.onlineMeetingUrl ?? null,
      },
    });
    return SessionMapper.toDomain(raw);
  }

  async updateStatus(
    id: string,
    status: SessionStatus,
    extra?: Partial<Pick<Session, 'completedAt' | 'cancellationReason' | 'cancelledBy'>>,
  ): Promise<Session> {
    const raw = await this.prisma.session.update({
      where: { id },
      data: {
        status,
        completedAt: extra?.completedAt ?? undefined,
        cancellationReason: extra?.cancellationReason ?? undefined,
        cancelledBy: extra?.cancelledBy ?? undefined,
      },
    });
    return SessionMapper.toDomain(raw);
  }
}

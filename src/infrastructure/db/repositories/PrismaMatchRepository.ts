import { PrismaClient } from '@prisma/client';
import { IMatchRepository } from '../../../application/ports/output/IMatchRepository';
import { Match } from '../../../domain/entities/Match';
import { MatchStatus } from '../../../domain/enums/MatchStatus';
import { MatchMapper } from '../mappers/MatchMapper';

export class PrismaMatchRepository implements IMatchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Match | null> {
    const raw = await this.prisma.match.findUnique({ where: { id } });
    return raw ? MatchMapper.toDomain(raw) : null;
  }

  async findByStudentId(studentId: string): Promise<Match[]> {
    const rows = await this.prisma.match.findMany({ where: { studentId }, orderBy: { requestedAt: 'desc' } });
    return rows.map(MatchMapper.toDomain);
  }

  async findActiveByStudentAndProfessional(studentId: string, professionalId: string): Promise<Match | null> {
    const raw = await this.prisma.match.findFirst({
      where: {
        studentId,
        professionalId,
        status: { in: [MatchStatus.PENDING, MatchStatus.ACCEPTED] },
      },
    });
    return raw ? MatchMapper.toDomain(raw) : null;
  }

  async save(match: Omit<Match, 'id'>): Promise<Match> {
    const raw = await this.prisma.match.create({
      data: {
        studentId: match.studentId,
        professionalId: match.professionalId,
        score: match.score,
        reasoning: match.reasoning,
        aiModelVersion: match.aiModelVersion,
        status: match.status,
        requestedAt: match.requestedAt,
        respondedAt: match.respondedAt ?? null,
        expiresAt: match.expiresAt,
      },
    });
    return MatchMapper.toDomain(raw);
  }

  async saveMany(matches: Omit<Match, 'id'>[]): Promise<Match[]> {
    return Promise.all(matches.map((m) => this.save(m)));
  }

  async updateStatus(id: string, status: MatchStatus, respondedAt?: Date): Promise<Match> {
    const raw = await this.prisma.match.update({
      where: { id },
      data: { status, respondedAt: respondedAt ?? null },
    });
    return MatchMapper.toDomain(raw);
  }
}

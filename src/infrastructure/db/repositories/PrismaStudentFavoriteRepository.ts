import { PrismaClient } from '@prisma/client';
import { IStudentFavoriteRepository } from '../../../application/ports/output/IStudentFavoriteRepository';

export class PrismaStudentFavoriteRepository implements IStudentFavoriteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listProfessionalIds(studentId: string): Promise<string[]> {
    const rows = await this.prisma.studentFavorite.findMany({
      where: { studentId },
      select: { professionalId: true },
    });
    return rows.map((r) => r.professionalId);
  }

  async toggle(studentId: string, professionalId: string): Promise<{ favorited: boolean }> {
    const existing = await this.prisma.studentFavorite.findUnique({
      where: {
        studentId_professionalId: { studentId, professionalId },
      },
    });
    if (existing) {
      await this.prisma.studentFavorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }
    await this.prisma.studentFavorite.create({
      data: { studentId, professionalId },
    });
    return { favorited: true };
  }

  async countReceivedByProfessional(professionalId: string): Promise<number> {
    return this.prisma.studentFavorite.count({ where: { professionalId } });
  }
}

import { PrismaClient, Prisma } from '@prisma/client';
import { IProfileViewRepository, RecordViewInput } from '../../../application/ports/output/IProfileViewRepository';

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export class PrismaProfileViewRepository implements IProfileViewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async recordView(input: RecordViewInput): Promise<{ recorded: boolean }> {
    try {
      await this.prisma.profileView.create({
        data: {
          professionalId: input.professionalId,
          viewerUserId: input.viewerUserId,
          viewDate: startOfDay(new Date()),
        },
      });
      return { recorded: true };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return { recorded: false };
      }
      throw err;
    }
  }

  async countTotal(professionalId: string): Promise<number> {
    return this.prisma.profileView.count({ where: { professionalId } });
  }

  async countInRange(professionalId: string, from: Date, to: Date): Promise<number> {
    return this.prisma.profileView.count({
      where: { professionalId, createdAt: { gte: from, lt: to } },
    });
  }

  async countAllInRange(from: Date, to: Date): Promise<number> {
    return this.prisma.profileView.count({ where: { createdAt: { gte: from, lt: to } } });
  }
}

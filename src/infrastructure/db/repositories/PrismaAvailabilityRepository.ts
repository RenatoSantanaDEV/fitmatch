import { PrismaClient } from '@prisma/client';
import { IAvailabilityRepository } from '../../../application/ports/output/IAvailabilityRepository';
import { Availability } from '../../../domain/entities/Availability';
import { AvailabilityRecurrence } from '../../../domain/enums/AvailabilityRecurrence';

function toDomain(raw: {
  id: string;
  professionalId: string;
  dayOfWeek: number | null;
  startTime: Date;
  endTime: Date;
  recurrence: string;
  isBooked: boolean;
  validFrom: Date;
  validUntil: Date | null;
}): Availability {
  return {
    id: raw.id,
    professionalId: raw.professionalId,
    dayOfWeek: (raw.dayOfWeek ?? undefined) as Availability['dayOfWeek'],
    timeSlot: { startTime: raw.startTime, endTime: raw.endTime },
    recurrence: raw.recurrence as AvailabilityRecurrence,
    isBooked: raw.isBooked,
    validFrom: raw.validFrom,
    validUntil: raw.validUntil ?? undefined,
  };
}

export class PrismaAvailabilityRepository implements IAvailabilityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Availability | null> {
    const raw = await this.prisma.availability.findUnique({ where: { id } });
    return raw ? toDomain(raw) : null;
  }

  async findByProfessionalId(professionalId: string): Promise<Availability[]> {
    const rows = await this.prisma.availability.findMany({ where: { professionalId } });
    return rows.map(toDomain);
  }

  async findAvailableSlots(professionalId: string, from: Date, until: Date): Promise<Availability[]> {
    const rows = await this.prisma.availability.findMany({
      where: {
        professionalId,
        isBooked: false,
        startTime: { gte: from },
        endTime: { lte: until },
      },
    });
    return rows.map(toDomain);
  }

  async save(slot: Omit<Availability, 'id'>): Promise<Availability> {
    const raw = await this.prisma.availability.create({
      data: {
        professionalId: slot.professionalId,
        dayOfWeek: slot.dayOfWeek ?? null,
        startTime: slot.timeSlot.startTime,
        endTime: slot.timeSlot.endTime,
        recurrence: slot.recurrence,
        isBooked: slot.isBooked,
        validFrom: slot.validFrom,
        validUntil: slot.validUntil ?? null,
      },
    });
    return toDomain(raw);
  }

  async saveMany(slots: Omit<Availability, 'id'>[]): Promise<Availability[]> {
    return Promise.all(slots.map((s) => this.save(s)));
  }

  async markAsBooked(id: string): Promise<void> {
    await this.prisma.availability.update({ where: { id }, data: { isBooked: true } });
  }

  async deleteByProfessionalId(professionalId: string): Promise<void> {
    await this.prisma.availability.deleteMany({ where: { professionalId, isBooked: false } });
  }
}

import type { Session as PrismaSession } from '@prisma/client';
import { Session } from '../../../domain/entities/Session';
import { type Location } from '../../../domain/value-objects/Location';
import { SessionStatus } from '../../../domain/enums/SessionStatus';
import { SessionModality } from '../../../domain/enums/SessionModality';

export class SessionMapper {
  static toDomain(raw: PrismaSession): Session {
    const location: Location | undefined =
      raw.locationCity
        ? {
            street: raw.locationStreet ?? '',
            city: raw.locationCity,
            state: raw.locationState ?? '',
            country: raw.locationCountry ?? '',
            postalCode: raw.locationPostal ?? '',
          }
        : undefined;

    return {
      id: raw.id,
      studentId: raw.studentId,
      professionalId: raw.professionalId,
      matchId: raw.matchId ?? undefined,
      availabilityId: raw.availabilityId,
      timeSlot: { startTime: raw.startTime, endTime: raw.endTime },
      modality: raw.modality as SessionModality,
      location,
      onlineMeetingUrl: raw.onlineMeetingUrl ?? undefined,
      status: raw.status as SessionStatus,
      priceInCents: raw.priceInCents,
      currency: raw.currency,
      cancellationReason: raw.cancellationReason ?? undefined,
      cancelledBy: (raw.cancelledBy as Session['cancelledBy']) ?? undefined,
      completedAt: raw.completedAt ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}

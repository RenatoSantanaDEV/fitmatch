import { ISessionRepository } from '../../ports/output/ISessionRepository';
import { IAvailabilityRepository } from '../../ports/output/IAvailabilityRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { INotificationPort } from '../../ports/output/INotificationPort';
import { BookSessionDTO, SessionResponseDTO } from '../../dtos/session/SessionDTO';
import { SessionStatus } from '../../../domain/enums/SessionStatus';
import { assertSlotIsAvailable } from '../../../domain/rules/availabilityRules';
import { assertProfessionalIsAcceptingClients } from '../../../domain/rules/professionalRules';
import { UserNotFoundError } from '../../../domain/errors/UserErrors';
import { ProfessionalNotFoundError } from '../../../domain/errors/ProfessionalErrors';
import { AvailabilityNotFoundError } from '../../../domain/errors/AvailabilityErrors';

export class BookSessionUseCase {
  constructor(
    private readonly sessionRepo: ISessionRepository,
    private readonly availabilityRepo: IAvailabilityRepository,
    private readonly professionalRepo: IProfessionalRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly notificationPort: INotificationPort,
  ) {}

  async execute(userId: string, dto: BookSessionDTO): Promise<SessionResponseDTO> {
    const student = await this.studentRepo.findByUserId(userId);
    if (!student) throw new UserNotFoundError(userId);

    const professional = await this.professionalRepo.findById(dto.professionalId);
    if (!professional) throw new ProfessionalNotFoundError(dto.professionalId);

    assertProfessionalIsAcceptingClients(professional);

    const slot = await this.availabilityRepo.findById(dto.availabilityId);
    if (!slot) throw new AvailabilityNotFoundError(dto.availabilityId);

    assertSlotIsAvailable(slot);

    const session = await this.sessionRepo.save({
      studentId: student.id,
      professionalId: professional.id,
      matchId: dto.matchId,
      availabilityId: slot.id,
      timeSlot: slot.timeSlot,
      modality: dto.modality,
      location: dto.locationOverride ?? professional.location,
      onlineMeetingUrl: dto.onlineMeetingUrl,
      status: SessionStatus.PENDING,
      priceInCents: professional.sessionPrice.min,
      currency: professional.sessionPrice.currency,
      cancellationReason: undefined,
      cancelledBy: undefined,
      completedAt: undefined,
    });

    await this.availabilityRepo.markAsBooked(slot.id);

    this.notificationPort
      .sendSessionBookingConfirmation(session.id, userId)
      .catch(() => {});

    return {
      id: session.id,
      studentId: session.studentId,
      professionalId: session.professionalId,
      matchId: session.matchId,
      availabilityId: session.availabilityId,
      startTime: session.timeSlot.startTime,
      endTime: session.timeSlot.endTime,
      modality: session.modality,
      location: session.location,
      onlineMeetingUrl: session.onlineMeetingUrl,
      status: session.status,
      priceInCents: session.priceInCents,
      currency: session.currency,
      createdAt: session.createdAt,
    };
  }
}

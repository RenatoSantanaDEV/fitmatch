import { Availability } from '../../../domain/entities/Availability';

export interface IAvailabilityRepository {
  findById(id: string): Promise<Availability | null>;
  findByProfessionalId(professionalId: string): Promise<Availability[]>;
  findAvailableSlots(professionalId: string, from: Date, until: Date): Promise<Availability[]>;
  save(slot: Omit<Availability, 'id'>): Promise<Availability>;
  saveMany(slots: Omit<Availability, 'id'>[]): Promise<Availability[]>;
  markAsBooked(id: string): Promise<void>;
  deleteByProfessionalId(professionalId: string): Promise<void>;
}

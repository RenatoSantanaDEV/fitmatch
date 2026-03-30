import { Professional } from '../entities/Professional';
import {
  ProfessionalNotAcceptingClientsError,
  NoSpecializationError,
} from '../errors/ProfessionalErrors';

export function assertProfessionalIsAcceptingClients(professional: Professional): void {
  if (!professional.isAcceptingClients) {
    throw new ProfessionalNotAcceptingClientsError(professional.id);
  }
}

export function assertProfessionalHasSpecialization(professional: Professional): void {
  if (professional.specializations.length === 0) {
    throw new NoSpecializationError();
  }
}

export function assertPriceRangeIsValid(min: number, max: number): void {
  if (min <= 0) {
    throw new Error('Session price minimum must be greater than 0');
  }
  if (min > max) {
    throw new Error('Session price minimum must be less than or equal to maximum');
  }
}

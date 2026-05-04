import { SessionModality } from '../domain/enums/SessionModality';

export const SESSION_MODALITY_LABELS: Record<SessionModality, string> = {
  IN_PERSON: 'Presencial',
  ONLINE: 'Online',
  HYBRID: 'Híbrido (presencial e online)',
};

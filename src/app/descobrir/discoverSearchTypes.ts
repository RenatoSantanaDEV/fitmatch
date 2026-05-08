export type ModalityFilter = 'ONLINE' | 'IN_PERSON' | 'HYBRID' | null;

export interface SearchLocationOverrides {
  city?: string;
  state?: string;
  lat?: number | null;
  lng?: number | null;
}

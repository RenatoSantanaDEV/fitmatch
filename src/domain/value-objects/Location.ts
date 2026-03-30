export interface Location {
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly country: string;
  readonly postalCode: string;
  readonly latitude?: number;
  readonly longitude?: number;
}

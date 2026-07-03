import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IUserRepository } from '../../ports/output/IUserRepository';
import { ProfessionalResponseDTO } from '../../dtos/professional/ProfessionalDTO';
import { toProfessionalResponseDTO } from '../../dtos/professional/toProfessionalResponseDTO';

export type NearbyScope = 'nearby' | 'city' | 'national';

export interface ListNearbyProfessionalsInput {
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  radiusKm?: number;
  limit?: number;
}

export interface ListNearbyProfessionalsResult {
  scope: NearbyScope;
  locationLabel?: string;
  professionals: ProfessionalResponseDTO[];
}

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 10;
const DEFAULT_RADIUS_KM = 50;

export class ListNearbyProfessionalsUseCase {
  constructor(
    private readonly professionalRepo: IProfessionalRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: ListNearbyProfessionalsInput = {}): Promise<ListNearbyProfessionalsResult> {
    const limit = Math.min(input.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const hasGeo = input.lat != null && input.lng != null && Number.isFinite(input.lat) && Number.isFinite(input.lng);
    const city = input.city?.trim();
    const state = input.state?.trim();

    let scope: NearbyScope = 'national';
    let locationLabel: string | undefined;
    let result;

    if (hasGeo) {
      scope = 'nearby';
      locationLabel = this.formatLocationLabel(city, state);
      result = await this.professionalRepo.list({
        nearLat: input.lat,
        nearLng: input.lng,
        radiusKm: input.radiusKm ?? DEFAULT_RADIUS_KM,
        isAcceptingClients: true,
        page: 1,
        limit,
      });
    } else if (city) {
      scope = 'city';
      locationLabel = this.formatLocationLabel(city, state);
      result = await this.professionalRepo.list({
        city,
        state: state || undefined,
        cityInsensitive: true,
        isAcceptingClients: true,
        page: 1,
        limit,
      });
    } else {
      result = await this.professionalRepo.list({
        isAcceptingClients: true,
        page: 1,
        limit,
      });
    }

    const profiles = await this.userRepo.findNamesByIds(result.data.map((p) => p.userId));

    return {
      scope,
      locationLabel,
      professionals: result.data.map((p) => toProfessionalResponseDTO(p, profiles.get(p.userId))),
    };
  }

  private formatLocationLabel(city?: string, state?: string): string | undefined {
    if (!city) return undefined;
    return state ? `${city}, ${state}` : city;
  }
}

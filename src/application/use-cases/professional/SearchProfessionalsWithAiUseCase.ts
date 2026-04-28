import type { PaginatedResult } from '../../ports/output/IProfessionalRepository';
import type { ListProfessionalsDTO, ProfessionalResponseDTO } from '../../dtos/professional/ProfessionalDTO';
import { interpretProfessionalSearch, type InterpretedProfessionalSearch } from '../../../lib/interpretProfessionalSearch';
import { ListProfessionalsUseCase } from './ListProfessionalsUseCase';

export type SearchProfessionalsInput = ListProfessionalsDTO & {
  query: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
};

export class SearchProfessionalsWithAiUseCase {
  constructor(private readonly listProfessionals: ListProfessionalsUseCase) {}

  async execute(input: SearchProfessionalsInput): Promise<{
    interpreted: InterpretedProfessionalSearch;
    result: PaginatedResult<ProfessionalResponseDTO>;
  }> {
    const interpreted = await interpretProfessionalSearch(input.query, input.city, input.state);

    const specs =
      interpreted.specializations.length > 0
        ? interpreted.specializations
        : input.specializations?.length
          ? input.specializations
          : undefined;
    const mods =
      interpreted.modalities.length > 0
        ? interpreted.modalities
        : input.modalities?.length
          ? input.modalities
          : undefined;

    const mergedCity = (interpreted.city ?? input.city)?.trim();
    const mergedState = (interpreted.state ?? input.state)?.trim();
    const hasGeo =
      input.lat != null &&
      input.lng != null &&
      Number.isFinite(input.lat) &&
      Number.isFinite(input.lng) &&
      (input.radiusKm ?? 0) > 0;
    const hasSemantic = (specs?.length ?? 0) > 0 || (mods?.length ?? 0) > 0;
    const hasPlace = !!mergedCity || !!mergedState || hasGeo;

    if (!hasPlace && !hasSemantic) {
      return {
        interpreted: {
          specializations: [],
          modalities: [],
          city: mergedCity || undefined,
          state: mergedState || undefined,
          summary:
            'Indique cidade e UF, use a localização ou descreva a modalidade (ex.: yoga, personal funcional).',
        },
        result: {
          data: [],
          total: 0,
          page: input.page ?? 1,
          limit: input.limit ?? 20,
        },
      };
    }

    const result = await this.listProfessionals.execute({
      city: mergedCity || undefined,
      state: mergedState || undefined,
      specializations: specs,
      modalities: mods,
      maxPriceInCents: input.maxPriceInCents,
      nearLat: hasGeo ? input.lat : undefined,
      nearLng: hasGeo ? input.lng : undefined,
      radiusKm: hasGeo ? input.radiusKm : undefined,
      cityInsensitive: true,
      page: input.page,
      limit: input.limit,
    });

    return { interpreted, result };
  }
}

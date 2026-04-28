import { NextRequest } from 'next/server';
import { listProfessionalsUseCase } from '../../../container';
import { paginationSchema } from '../../../validation/shared';
import { SpecializationType } from '../../../domain/enums/SpecializationType';
import { SessionModality } from '../../../domain/enums/SessionModality';
import { ok, handleError } from '../../../lib/apiResponse';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const paginationResult = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });

  if (!paginationResult.success) {
    return ok({ error: paginationResult.error.issues }, 400);
  }

  try {
    const latRaw = searchParams.get('lat');
    const lngRaw = searchParams.get('lng');
    const radiusRaw = searchParams.get('radiusKm');
    const lat = latRaw != null && latRaw !== '' ? Number(latRaw) : undefined;
    const lng = lngRaw != null && lngRaw !== '' ? Number(lngRaw) : undefined;
    const radiusKm = radiusRaw != null && radiusRaw !== '' ? Number(radiusRaw) : undefined;
    const cityInsensitive =
      searchParams.get('cityInsensitive') === '1' || searchParams.get('cityInsensitive') === 'true';

    const result = await listProfessionalsUseCase.execute({
      city: searchParams.get('city') ?? undefined,
      state: searchParams.get('state') ?? undefined,
      cityInsensitive: cityInsensitive || undefined,
      specializations: searchParams.getAll('specialization') as SpecializationType[],
      modalities: searchParams.getAll('modality') as SessionModality[],
      maxPriceInCents: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      nearLat: Number.isFinite(lat) ? lat : undefined,
      nearLng: Number.isFinite(lng) ? lng : undefined,
      radiusKm: Number.isFinite(radiusKm) ? radiusKm : undefined,
      page: paginationResult.data.page,
      limit: paginationResult.data.limit,
    });
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}

import { type NextRequest } from 'next/server';
import { listNearbyProfessionalsUseCase } from '../../../../container';
import { ok, handleError } from '../../../../lib/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const latRaw = searchParams.get('lat');
  const lngRaw = searchParams.get('lng');
  const lat = latRaw != null && latRaw !== '' ? Number(latRaw) : undefined;
  const lng = lngRaw != null && lngRaw !== '' ? Number(lngRaw) : undefined;
  const radiusRaw = searchParams.get('radiusKm');
  const radiusKm = radiusRaw != null && radiusRaw !== '' ? Number(radiusRaw) : undefined;
  const limitParam = Number(searchParams.get('limit'));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

  try {
    const result = await listNearbyProfessionalsUseCase.execute({
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
      city: searchParams.get('city') ?? undefined,
      state: searchParams.get('state') ?? undefined,
      radiusKm: Number.isFinite(radiusKm) ? radiusKm : undefined,
      limit,
    });
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}

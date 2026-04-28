import { NextRequest } from 'next/server';
import { searchProfessionalsWithAiUseCase } from '../../../../container';
import { searchProfessionalsBodySchema } from '../../../../validation/professional/searchProfessionalsSchema';
import { badRequest, handleError, ok, unauthorized } from '../../../../lib/apiResponse';
import { auth } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const raw = await req.json().catch(() => ({}));
  const parsed = searchProfessionalsBodySchema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  const b = parsed.data;
  try {
    const useGeo = b.lat != null && b.lng != null && Number.isFinite(b.lat) && Number.isFinite(b.lng);
    const { interpreted, result } = await searchProfessionalsWithAiUseCase.execute({
      query: b.query,
      city: b.city,
      state: b.state?.toUpperCase(),
      lat: useGeo ? b.lat : undefined,
      lng: useGeo ? b.lng : undefined,
      radiusKm: useGeo ? b.radiusKm : undefined,
      page: b.page,
      limit: b.limit,
    });
    return ok({ interpreted, ...result });
  } catch (err) {
    return handleError(err);
  }
}

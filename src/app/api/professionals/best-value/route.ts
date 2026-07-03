import { type NextRequest } from 'next/server';
import { listBestValueProfessionalsUseCase } from '../../../../container';
import { ok, handleError } from '../../../../lib/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const limitParam = Number(req.nextUrl.searchParams.get('limit'));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

  try {
    const data = await listBestValueProfessionalsUseCase.execute({ limit });
    return ok({ data });
  } catch (err) {
    return handleError(err);
  }
}

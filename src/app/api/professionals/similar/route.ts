import { type NextRequest } from 'next/server';
import { listSimilarProfessionalsUseCase } from '../../../../container';
import { ok, badRequest, handleError } from '../../../../lib/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const excludeProfessionalId = req.nextUrl.searchParams.get('excludeProfessionalId');
  if (!excludeProfessionalId) return badRequest('excludeProfessionalId é obrigatório.');

  const specializationSlugs = (req.nextUrl.searchParams.get('areas') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const limitParam = Number(req.nextUrl.searchParams.get('limit'));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

  try {
    const data = await listSimilarProfessionalsUseCase.execute({
      excludeProfessionalId,
      specializationSlugs,
      limit,
    });
    return ok({ data });
  } catch (err) {
    return handleError(err);
  }
}

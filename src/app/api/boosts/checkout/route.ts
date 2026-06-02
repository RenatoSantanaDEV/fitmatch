import { type NextRequest } from 'next/server';
import { auth } from '../../../../lib/auth';
import { startBoostCheckoutUseCase } from '../../../../container';
import { ok, unauthorized, badRequest, forbidden, handleError } from '../../../../lib/apiResponse';
import { BoostTier } from '../../../../domain/enums/BoostTier';
import { UserRole } from '../../../../domain/enums/UserRole';

const VALID_TIERS = new Set<string>(Object.values(BoostTier));

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== UserRole.PROFESSIONAL) return forbidden();

  let body: { tier?: unknown };
  try {
    body = (await req.json()) as { tier?: unknown };
  } catch {
    return badRequest('Corpo da requisição inválido.');
  }

  if (!body.tier || typeof body.tier !== 'string' || !VALID_TIERS.has(body.tier)) {
    return badRequest('tier deve ser BASICO, PLUS ou PREMIUM.');
  }

  const baseUrl = req.nextUrl.origin;

  try {
    const result = await startBoostCheckoutUseCase.execute({
      userId: session.user.id,
      tier: body.tier as BoostTier,
      baseUrl,
    });
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}

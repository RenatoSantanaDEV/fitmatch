import { auth } from '../../../../../lib/auth';
import { getProfessionalInsightsUseCase } from '../../../../../container';
import { ok, unauthorized, forbidden, handleError } from '../../../../../lib/apiResponse';
import { UserRole } from '../../../../../domain/enums/UserRole';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== UserRole.PROFESSIONAL) return forbidden();

  try {
    const dto = await getProfessionalInsightsUseCase.execute({ professionalUserId: session.user.id });
    return ok(dto);
  } catch (err) {
    return handleError(err);
  }
}

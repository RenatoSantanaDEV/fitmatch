import { auth } from '../../../../lib/auth';
import { boostRepo, professionalRepo } from '../../../../container';
import { ok, unauthorized, forbidden } from '../../../../lib/apiResponse';
import { UserRole } from '../../../../domain/enums/UserRole';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== UserRole.PROFESSIONAL) return forbidden();

  const professional = await professionalRepo.findByUserId(session.user.id);
  if (!professional) return ok({ boost: null });

  const boost = await boostRepo.findActiveByProfessionalId(professional.id);
  if (!boost) return ok({ boost: null });

  return ok({
    boost: {
      id: boost.id,
      tier: boost.tier,
      expiresAt: boost.expiresAt,
      status: boost.status,
    },
  });
}

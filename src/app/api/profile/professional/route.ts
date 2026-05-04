import { type NextRequest } from 'next/server';
import { auth } from '../../../../lib/auth';
import { badRequest, forbidden, handleError, noContent, unauthorized } from '../../../../lib/apiResponse';
import { professionalRepo, userRepo } from '../../../../container';
import { updateProfessionalStep2Schema } from '../../../../validation/profile/updateProfessionalStep2Schema';

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'PROFESSIONAL') return forbidden();

  const raw = await req.json().catch(() => ({}));
  const parsed = updateProfessionalStep2Schema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  const professional = await professionalRepo.findByUserId(session.user.id);
  if (!professional) return forbidden();

  const { name, bio, yearsExperience, crefNumber, phone } = parsed.data;

  try {
    const userPatch: Record<string, unknown> = { name };
    if (phone !== undefined) userPatch.phone = phone ?? null;

    await userRepo.update(session.user.id, userPatch as Parameters<typeof userRepo.update>[1]);

    await professionalRepo.update(professional.id, {
      bio: bio !== undefined ? bio : professional.bio,
      yearsExperience,
      crefNumber: crefNumber !== undefined ? (crefNumber ?? undefined) : professional.crefNumber,
    });

    return noContent();
  } catch (err) {
    return handleError(err);
  }
}

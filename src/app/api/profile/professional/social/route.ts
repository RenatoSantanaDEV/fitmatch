import { type NextRequest } from 'next/server';
import { auth } from '../../../../../lib/auth';
import { badRequest, forbidden, handleError, noContent, unauthorized } from '../../../../../lib/apiResponse';
import { professionalRepo } from '../../../../../container';
import { updateProfessionalSocialLinksSchema } from '../../../../../validation/profile/updateProfessionalSocialLinksSchema';

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'PROFESSIONAL') return forbidden();

  const raw = await req.json().catch(() => ({}));
  const parsed = updateProfessionalSocialLinksSchema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  const professional = await professionalRepo.findByUserId(session.user.id);
  if (!professional) return forbidden();

  const { linkedinUrl, instagramUrl, facebookUrl, websiteUrl } = parsed.data;

  try {
    await professionalRepo.update(professional.id, {
      linkedinUrl: linkedinUrl !== undefined ? (linkedinUrl ?? undefined) : professional.linkedinUrl,
      instagramUrl: instagramUrl !== undefined ? (instagramUrl ?? undefined) : professional.instagramUrl,
      facebookUrl: facebookUrl !== undefined ? (facebookUrl ?? undefined) : professional.facebookUrl,
      websiteUrl: websiteUrl !== undefined ? (websiteUrl ?? undefined) : professional.websiteUrl,
    });

    return noContent();
  } catch (err) {
    return handleError(err);
  }
}

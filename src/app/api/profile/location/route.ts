import { NextRequest } from 'next/server';
import { auth } from '../../../../lib/auth';
import { studentRepo, professionalRepo } from '../../../../container';
import { updateProfileLocationBodySchema } from '../../../../validation/profile/updateLocationSchema';
import { badRequest, handleError, noContent, unauthorized, unprocessable } from '../../../../lib/apiResponse';

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const raw = await req.json().catch(() => ({}));
  const parsed = updateProfileLocationBodySchema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  const loc = {
    street: parsed.data.street,
    city: parsed.data.city,
    state: parsed.data.state,
    country: parsed.data.country,
    postalCode: parsed.data.postalCode,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
  };

  try {
    if (session.user.role === 'PROFESSIONAL') {
      const professional = await professionalRepo.findByUserId(session.user.id);
      if (!professional) return unprocessable('Perfil de professor não encontrado.');
      await professionalRepo.update(professional.id, {
        location: {
          street: loc.street,
          city: loc.city,
          state: loc.state,
          country: loc.country,
          postalCode: loc.postalCode,
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
      });
      return noContent();
    }

    const student = await studentRepo.findByUserId(session.user.id);
    if (!student) return unprocessable('Perfil de aluno não encontrado.');

    await studentRepo.update(student.id, {
      preferredLocation: {
        street: loc.street,
        city: loc.city,
        state: loc.state,
        country: loc.country,
        postalCode: loc.postalCode,
        latitude: loc.latitude,
        longitude: loc.longitude,
      },
    });
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}

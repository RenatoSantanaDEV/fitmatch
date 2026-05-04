import { type NextRequest } from 'next/server';
import { auth } from '../../../../../lib/auth';
import { badRequest, forbidden, handleError, noContent, unauthorized } from '../../../../../lib/apiResponse';
import { professionalRepo } from '../../../../../container';
import { updateProfessionalStep3Schema } from '../../../../../validation/profile/updateProfessionalStep3Schema';
import { getPrismaClient } from '../../../../../infrastructure/db/prisma/client';
const prisma = getPrismaClient();

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'PROFESSIONAL') return forbidden();

  const raw = await req.json().catch(() => ({}));
  const parsed = updateProfessionalStep3Schema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  const professional = await professionalRepo.findByUserId(session.user.id);
  if (!professional) return forbidden();

  const { areaIds, modalities, locationCity, locationState, priceMin, priceMax } = parsed.data;

  try {
    const areas = await prisma.areaAtuacao.findMany({
      where: { id: { in: areaIds }, ativo: true },
    });

    if (areas.length === 0) return badRequest('Nenhuma área de atuação válida foi selecionada.');

    await professionalRepo.update(professional.id, {
      areas: areas.map((a) => ({ id: a.id, nome: a.nome, slug: a.slug })),
      modalities,
      location: {
        street: professional.location.street,
        city: locationCity ?? professional.location.city,
        state: locationState ?? professional.location.state,
        country: professional.location.country || 'Brasil',
        postalCode: professional.location.postalCode,
        latitude: professional.location.latitude,
        longitude: professional.location.longitude,
      },
      sessionPrice: {
        min: priceMin ?? professional.sessionPrice.min,
        max: priceMax ?? professional.sessionPrice.max,
        currency: 'BRL',
      },
    });

    return noContent();
  } catch (err) {
    return handleError(err);
  }
}

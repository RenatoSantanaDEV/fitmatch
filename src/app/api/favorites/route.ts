import { NextRequest } from 'next/server';
import { studentFavoriteRepo, studentRepo } from '../../../container';
import { toggleFavoriteBodySchema } from '../../../validation/professional/toggleFavoriteSchema';
import { badRequest, handleError, ok, unauthorized } from '../../../lib/apiResponse';
import { auth } from '../../../lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const student = await studentRepo.findByUserId(session.user.id);
    if (!student) return ok({ professionalIds: [] as string[] });
    const professionalIds = await studentFavoriteRepo.listProfessionalIds(student.id);
    return ok({ professionalIds });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const raw = await req.json().catch(() => ({}));
  const parsed = toggleFavoriteBodySchema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  try {
    const student = await studentRepo.findByUserId(session.user.id);
    if (!student) return badRequest('Perfil de aluno não encontrado.');
    const { favorited } = await studentFavoriteRepo.toggle(student.id, parsed.data.professionalId);
    return ok({ favorited });
  } catch (err) {
    return handleError(err);
  }
}

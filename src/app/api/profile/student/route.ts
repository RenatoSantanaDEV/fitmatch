import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '../../../../lib/auth';
import { getPrismaClient } from '../../../../infrastructure/db/prisma/client';
import { badRequest, handleError, noContent, ok, unauthorized } from '../../../../lib/apiResponse';
import { ExperienceLevel } from '../../../../domain/enums/ExperienceLevel';
import { SessionModality } from '../../../../domain/enums/SessionModality';

const patchSchema = z.object({
  fitnessGoals: z.array(z.string().min(1)).min(1).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  preferredModality: z.nativeEnum(SessionModality).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const prisma = getPrismaClient();
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { fitnessGoals: true, experienceLevel: true, preferredModality: true },
    });

    return ok(student ?? null);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const raw = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  if (Object.keys(parsed.data).length === 0) return noContent();

  try {
    const prisma = getPrismaClient();
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!student) return badRequest('Perfil de aluno não encontrado.');

    await prisma.student.update({ where: { id: student.id }, data: parsed.data });
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}

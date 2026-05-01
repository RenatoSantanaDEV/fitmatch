import { NextRequest } from 'next/server';
import { z } from 'zod';
import { compareSync, hashSync } from 'bcryptjs';
import { auth } from '../../../../lib/auth';
import { getPrismaClient } from '../../../../infrastructure/db/prisma/client';
import { badRequest, handleError, noContent, unauthorized, unprocessable } from '../../../../lib/apiResponse';

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres.'),
});

const prisma = getPrismaClient();

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const raw = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  try {
    const row = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!row?.passwordHash) {
      return unprocessable('Esta conta não usa senha — faça login pelo provedor social.');
    }

    if (!compareSync(parsed.data.currentPassword, row.passwordHash)) {
      return unprocessable('Senha atual incorreta.');
    }

    const newHash = hashSync(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newHash },
    });

    return noContent();
  } catch (err) {
    return handleError(err);
  }
}

import { UserRole } from '@prisma/client';
import { getPrismaClient } from '../db/prisma/client';
import { defaultStudentUncheckedCreateInput } from './defaultStudentProfile';

export async function ensureStudentForUser(userId: string): Promise<void> {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== UserRole.STUDENT) return;

  const existing = await prisma.student.findUnique({ where: { userId } });
  if (existing) return;

  await prisma.student.create({
    data: defaultStudentUncheckedCreateInput(userId),
  });
}

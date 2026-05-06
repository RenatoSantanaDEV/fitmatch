import { type NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { auth } from '../../../../../../lib/auth';
import { getPrismaClient } from '../../../../../../infrastructure/db/prisma/client';
import { forbidden, handleError, noContent, unauthorized } from '../../../../../../lib/apiResponse';

const prisma = getPrismaClient();

async function getOwnedCert(certId: string, userId: string) {
  const cert = await prisma.certification.findUnique({
    where: { id: certId },
    include: { professional: { select: { userId: true } } },
  });
  if (!cert || cert.professional.userId !== userId) return null;
  return cert;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'PROFESSIONAL') return forbidden();

  const { id } = await params;
  try {
    const cert = await getOwnedCert(id, session.user.id);
    if (!cert) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });

    if (cert.documentUrl) {
      await del(cert.documentUrl).catch(() => undefined);
    }

    await prisma.certification.delete({ where: { id } });
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}

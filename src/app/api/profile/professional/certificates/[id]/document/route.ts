import { type NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { auth } from '../../../../../../../lib/auth';
import { getPrismaClient } from '../../../../../../../infrastructure/db/prisma/client';
import { forbidden, handleError, unauthorized } from '../../../../../../../lib/apiResponse';

const prisma = getPrismaClient();

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'PROFESSIONAL') return forbidden();

  const { id } = await params;

  const cert = await prisma.certification.findUnique({
    where: { id },
    include: { professional: { select: { userId: true } } },
  });

  if (!cert || cert.professional.userId !== session.user.id) {
    return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get('document');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Envie um arquivo.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Formato inválido. Use PDF, JPEG, PNG ou WebP.' },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'O arquivo deve ter no máximo 10 MB.' }, { status: 400 });
  }

  try {
    if (cert.documentUrl) {
      await del(cert.documentUrl).catch(() => undefined);
    }

    const blob = await put(
      `certificates/${session.user.id}/${id}/${Date.now()}-${file.name}`,
      file,
      { access: 'private', contentType: file.type },
    );

    // Store the stable blob URL; access via /api/profile/professional/certificates/[id]/document/view
    await prisma.certification.update({
      where: { id },
      data: { documentUrl: blob.url },
    });

    const viewUrl = `/api/profile/professional/certificates/${id}/document/view`;
    return NextResponse.json({ url: viewUrl });
  } catch (err) {
    return handleError(err);
  }
}

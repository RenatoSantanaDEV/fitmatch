import { type NextRequest, NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import { auth } from '../../../../../../../../lib/auth';
import { getPrismaClient } from '../../../../../../../../infrastructure/db/prisma/client';
import { forbidden, unauthorized } from '../../../../../../../../lib/apiResponse';

const prisma = getPrismaClient();

export async function GET(
  _req: NextRequest,
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

  if (!cert || cert.professional.userId !== session.user.id || !cert.documentUrl) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const meta = await head(cert.documentUrl);
    const token = process.env.BLOB_READ_WRITE_TOKEN ?? '';
    const upstream = await fetch(cert.documentUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!upstream.ok) return new NextResponse(null, { status: 404 });

    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': meta.contentType,
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `inline; filename="${meta.pathname.split('/').pop()}"`,
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}

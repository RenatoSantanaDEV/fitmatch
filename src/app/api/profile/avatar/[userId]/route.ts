import { type NextRequest, NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import { userRepo } from '../../../../../container';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  const user = await userRepo.findById(userId).catch(() => null);
  const blobUrl = user?.avatarUrl;

  if (!blobUrl?.startsWith('https://')) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const meta = await head(blobUrl);
    const token = process.env.BLOB_READ_WRITE_TOKEN ?? '';
    const upstream = await fetch(blobUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!upstream.ok) return new NextResponse(null, { status: 404 });

    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': meta.contentType,
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}

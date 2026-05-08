import { type NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { auth } from '../../../../lib/auth';
import { userRepo } from '../../../../container';
import { unauthorized, handleError } from '../../../../lib/apiResponse';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const formData = await req.formData().catch(() => null);
  const file = formData?.get('photo');

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Envie um arquivo de imagem.' }, { status: 400 });
  }
  const fileBlob = file as Blob & { name?: string };
  if (!ALLOWED_TYPES.includes(fileBlob.type)) {
    return NextResponse.json(
      { error: 'Formato inválido. Use JPEG, PNG ou WebP.' },
      { status: 400 },
    );
  }
  if (fileBlob.size > MAX_BYTES) {
    return NextResponse.json({ error: 'A foto deve ter no máximo 5 MB.' }, { status: 400 });
  }

  try {
    const user = await userRepo.findById(session.user.id);
    const oldUrl = user?.avatarUrl;

    const filename = fileBlob.name ?? 'photo';
    const blob = await put(`avatars/${session.user.id}/${Date.now()}-${filename}`, fileBlob, {
      access: 'private',
      contentType: fileBlob.type,
    });

    await userRepo.update(session.user.id, { avatarUrl: blob.url });

    if (oldUrl?.includes('vercel-storage.com')) {
      await del(oldUrl).catch(() => undefined);
    }

    const proxyUrl = `/api/profile/avatar/${session.user.id}?t=${Date.now()}`;
    return NextResponse.json({ url: proxyUrl });
  } catch (err) {
    return handleError(err);
  }
}

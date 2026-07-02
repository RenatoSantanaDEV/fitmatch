import { type NextRequest } from 'next/server';
import { auth } from '../../../../../lib/auth';
import { recordProfileViewUseCase } from '../../../../../container';
import { noContent, unauthorized, handleError } from '../../../../../lib/apiResponse';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { userId } = await params;

  try {
    await recordProfileViewUseCase.execute({
      profileOwnerUserId: userId,
      viewerUserId: session.user.id,
    });
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}

import { NextRequest } from 'next/server';
import { auth } from '../../../../../../lib/auth';
import { handleError, ok, unauthorized } from '../../../../../../lib/apiResponse';
import { getCounterpartDetailsUseCase } from '../../../../../../container';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const { id } = await params;

  try {
    const details = await getCounterpartDetailsUseCase.execute({
      userId: session.user.id,
      conversationId: id,
    });
    return ok(details);
  } catch (err) {
    return handleError(err);
  }
}

import { NextRequest } from 'next/server';
import { auth } from '../../../../../../lib/auth';
import { handleError, noContent, unauthorized } from '../../../../../../lib/apiResponse';
import { markConversationReadUseCase } from '../../../../../../container';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const { id } = await params;

  try {
    await markConversationReadUseCase.execute({
      userId: session.user.id,
      conversationId: id,
    });
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}

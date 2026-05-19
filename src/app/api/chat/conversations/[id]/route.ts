import { NextRequest } from 'next/server';
import { auth } from '../../../../../lib/auth';
import {
  badRequest,
  handleError,
  noContent,
  ok,
  unauthorized,
} from '../../../../../lib/apiResponse';
import {
  getConversationUseCase,
  setConversationStatusUseCase,
} from '../../../../../container';
import { setConversationStatusSchema } from '../../../../../validation/chat';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const { id } = await params;

  try {
    const conversation = await getConversationUseCase.execute({
      userId: session.user.id,
      conversationId: id,
    });
    return ok(conversation);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const { id } = await params;

  const raw = await req.json().catch(() => ({}));
  const parsed = setConversationStatusSchema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  try {
    await setConversationStatusUseCase.execute({
      userId: session.user.id,
      conversationId: id,
      status: parsed.data.status,
    });
    return noContent();
  } catch (err) {
    return handleError(err);
  }
}

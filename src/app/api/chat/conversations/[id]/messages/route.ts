import { NextRequest } from 'next/server';
import { auth } from '../../../../../../lib/auth';
import {
  badRequest,
  created,
  handleError,
  ok,
  tooManyRequests,
  unauthorized,
} from '../../../../../../lib/apiResponse';
import {
  listMessagesUseCase,
  sendMessageUseCase,
} from '../../../../../../container';
import { sendMessageSchema } from '../../../../../../validation/chat';
import { checkRateLimit } from '../../../../../../lib/rateLimit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const { id } = await params;

  const { searchParams } = new URL(req.url);
  const before = searchParams.get('before') ?? undefined;
  const limitRaw = searchParams.get('limit');
  const limit = limitRaw ? Number(limitRaw) : undefined;

  try {
    const result = await listMessagesUseCase.execute({
      userId: session.user.id,
      conversationId: id,
      before,
      limit: Number.isFinite(limit) ? (limit as number) : undefined,
    });
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const { id } = await params;

  const rl = checkRateLimit(`chat:send:${session.user.id}`, 20, 10_000);
  if (!rl.ok) {
    return tooManyRequests(rl.retryAfter, 'Você está enviando mensagens rápido demais.');
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = sendMessageSchema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  try {
    const message = await sendMessageUseCase.execute({
      userId: session.user.id,
      conversationId: id,
      body: parsed.data.body,
    });
    return created(message);
  } catch (err) {
    return handleError(err);
  }
}

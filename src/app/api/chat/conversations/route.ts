import { NextRequest } from 'next/server';
import { auth } from '../../../../lib/auth';
import {
  badRequest,
  created,
  handleError,
  ok,
  tooManyRequests,
  unauthorized,
} from '../../../../lib/apiResponse';
import {
  listConversationsUseCase,
  startConversationUseCase,
  getUnreadSummaryUseCase,
} from '../../../../container';
import { startConversationSchema } from '../../../../validation/chat';
import { checkRateLimit } from '../../../../lib/rateLimit';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const rl = checkRateLimit(`chat:start:${session.user.id}`, 10, 60_000);
  if (!rl.ok) {
    return tooManyRequests(rl.retryAfter, 'Aguarde antes de iniciar mais conversas.');
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = startConversationSchema.safeParse(raw);
  if (!parsed.success) return badRequest(parsed.error.issues);

  try {
    const conversation = await startConversationUseCase.execute({
      userId: session.user.id,
      professionalId: parsed.data.professionalId,
    });
    return created(conversation);
  } catch (err) {
    return handleError(err);
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { searchParams } = new URL(req.url);
  if (searchParams.get('summary') === '1') {
    try {
      const summary = await getUnreadSummaryUseCase.execute(session.user.id);
      return ok(summary);
    } catch (err) {
      return handleError(err);
    }
  }

  const cursor = searchParams.get('cursor') ?? undefined;
  const limitRaw = searchParams.get('limit');
  const limit = limitRaw ? Number(limitRaw) : undefined;

  try {
    const result = await listConversationsUseCase.execute({
      userId: session.user.id,
      cursor,
      limit: Number.isFinite(limit) ? (limit as number) : undefined,
    });
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}

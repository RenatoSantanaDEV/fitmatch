import { NextRequest } from 'next/server';
import { auth } from '../../../../lib/auth';
import { authorizeConversationAccessUseCase } from '../../../../container';
import { subscribeToChat } from '../../../../infrastructure/realtime/PgListenClient';
import { ChatRealtimePayload } from '../../../../application/ports/output/IChatRealtimePort';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KEEP_ALIVE_INTERVAL_MS = 25_000;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');
  if (!conversationId) {
    return new Response('conversationId is required', { status: 400 });
  }

  let auth_;
  try {
    auth_ = await authorizeConversationAccessUseCase.execute(
      session.user.id,
      conversationId,
    );
  } catch {
    return new Response('Forbidden', { status: 403 });
  }

  const encoder = new TextEncoder();
  const expectedStudentId = auth_.studentId;
  const expectedProfessionalId = auth_.professionalId;

  let unsubscribe: (() => void) | null = null;
  let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          // Stream closed; cleanup will happen in cancel().
        }
      };

      controller.enqueue(encoder.encode(`event: ready\ndata: {"ok":true}\n\n`));

      try {
        unsubscribe = await subscribeToChat((payload: ChatRealtimePayload) => {
          if (payload.conversationId !== conversationId) return;
          if (
            payload.studentId !== expectedStudentId ||
            payload.professionalId !== expectedProfessionalId
          ) {
            return;
          }
          send('message', payload.message);
        });
      } catch (err) {
        send('error', { message: 'realtime_unavailable' });
        console.error('[SSE chat/stream] subscribe failed', err);
      }

      keepAliveTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // ignore — cancel() will run.
        }
      }, KEEP_ALIVE_INTERVAL_MS);

      req.signal.addEventListener('abort', () => {
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      if (keepAliveTimer) clearInterval(keepAliveTimer);
      if (unsubscribe) unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

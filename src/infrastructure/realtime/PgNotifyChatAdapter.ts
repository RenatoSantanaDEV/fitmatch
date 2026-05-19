import { PrismaClient } from '@prisma/client';
import {
  ChatRealtimePayload,
  IChatRealtimePort,
} from '../../application/ports/output/IChatRealtimePort';

export const CHAT_NOTIFY_CHANNEL = 'chat_msg';

const PG_NOTIFY_PAYLOAD_LIMIT = 7900;

/**
 * Publishes chat events via Postgres pg_notify on the channel `chat_msg`.
 * Reuses the Prisma connection pool — no extra connections required for
 * write-side fan-out. Subscribers should use {@link PgListenClient}.
 */
export class PgNotifyChatAdapter implements IChatRealtimePort {
  constructor(private readonly prisma: PrismaClient) {}

  async publishMessage(payload: ChatRealtimePayload): Promise<void> {
    const serialized = JSON.stringify(payload);
    if (serialized.length > PG_NOTIFY_PAYLOAD_LIMIT) {
      // Drop the body and force consumers to refetch the message via REST.
      const trimmed: ChatRealtimePayload = {
        ...payload,
        message: { ...payload.message, body: '' },
      };
      await this.prisma.$executeRawUnsafe(
        `SELECT pg_notify($1, $2)`,
        CHAT_NOTIFY_CHANNEL,
        JSON.stringify(trimmed),
      );
      return;
    }
    await this.prisma.$executeRawUnsafe(
      `SELECT pg_notify($1, $2)`,
      CHAT_NOTIFY_CHANNEL,
      serialized,
    );
  }
}

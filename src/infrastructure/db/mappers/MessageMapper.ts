import type { Message as PrismaMessage } from '@prisma/client';
import { Message } from '../../../domain/entities/Message';

export class MessageMapper {
  static toDomain(raw: PrismaMessage): Message {
    return {
      id: raw.id,
      conversationId: raw.conversationId,
      senderUserId: raw.senderUserId,
      body: raw.body,
      readAt: raw.readAt ?? null,
      createdAt: raw.createdAt,
    };
  }
}

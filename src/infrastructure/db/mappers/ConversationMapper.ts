import type { Conversation as PrismaConversation } from '@prisma/client';
import { Conversation } from '../../../domain/entities/Conversation';
import { ConversationStatus } from '../../../domain/enums/ConversationStatus';

export class ConversationMapper {
  static toDomain(raw: PrismaConversation): Conversation {
    return {
      id: raw.id,
      studentId: raw.studentId,
      professionalId: raw.professionalId,
      fromMatchId: raw.fromMatchId ?? null,
      status: raw.status as ConversationStatus,
      lastMessageAt: raw.lastMessageAt ?? null,
      lastMessagePreview: raw.lastMessagePreview ?? null,
      studentUnread: raw.studentUnread,
      professionalUnread: raw.professionalUnread,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}

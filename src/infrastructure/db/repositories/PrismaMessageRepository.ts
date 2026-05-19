import { PrismaClient } from '@prisma/client';
import {
  CreateMessageInput,
  IMessageRepository,
  ListMessagesParams,
} from '../../../application/ports/output/IMessageRepository';
import { Message } from '../../../domain/entities/Message';
import { MessageMapper } from '../mappers/MessageMapper';

export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listByConversation(params: ListMessagesParams): Promise<{
    items: Message[];
    hasMore: boolean;
  }> {
    const rows = await this.prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
        ...(params.before ? { createdAt: { lt: params.before } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit + 1,
    });

    const hasMore = rows.length > params.limit;
    const slice = rows.slice(0, params.limit);

    return {
      items: slice.map(MessageMapper.toDomain).reverse(),
      hasMore,
    };
  }

  async create(input: CreateMessageInput): Promise<Message> {
    const raw = await this.prisma.message.create({
      data: {
        conversationId: input.conversationId,
        senderUserId: input.senderUserId,
        body: input.body,
      },
    });
    return MessageMapper.toDomain(raw);
  }
}

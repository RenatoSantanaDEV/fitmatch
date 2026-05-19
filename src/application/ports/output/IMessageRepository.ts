import { Message } from '../../../domain/entities/Message';

export interface CreateMessageInput {
  conversationId: string;
  senderUserId: string;
  body: string;
}

export interface ListMessagesParams {
  conversationId: string;
  before?: Date | undefined;
  limit: number;
}

export interface IMessageRepository {
  listByConversation(params: ListMessagesParams): Promise<{
    items: Message[];
    hasMore: boolean;
  }>;
  create(input: CreateMessageInput): Promise<Message>;
}

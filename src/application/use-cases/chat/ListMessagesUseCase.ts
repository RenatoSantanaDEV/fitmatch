import { IConversationRepository } from '../../ports/output/IConversationRepository';
import { IMessageRepository } from '../../ports/output/IMessageRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { MessageListDTO } from '../../dtos/chat/ChatDTO';
import {
  ConversationNotFoundError,
  NotAConversationParticipantError,
} from '../../../domain/errors/ChatErrors';
import { CHAT_LIMITS, isConversationParticipant } from '../../../domain/rules/chatRules';
import { resolveRequester } from './resolveRequester';

export interface ListMessagesInput {
  userId: string;
  conversationId: string;
  before?: string;
  limit?: number;
}

export class ListMessagesUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly messageRepo: IMessageRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly professionalRepo: IProfessionalRepository,
  ) {}

  async execute(input: ListMessagesInput): Promise<MessageListDTO> {
    const conversation = await this.conversationRepo.findById(input.conversationId);
    if (!conversation) throw new ConversationNotFoundError(input.conversationId);

    const requester = await resolveRequester(
      input.userId,
      this.studentRepo,
      this.professionalRepo,
    );
    if (!isConversationParticipant(conversation, requester)) {
      throw new NotAConversationParticipantError();
    }

    const limit = Math.min(
      Math.max(input.limit ?? CHAT_LIMITS.MESSAGES_PAGE_SIZE_DEFAULT, 1),
      CHAT_LIMITS.MESSAGES_PAGE_SIZE_MAX,
    );

    const before = input.before ? new Date(input.before) : undefined;

    const result = await this.messageRepo.listByConversation({
      conversationId: conversation.id,
      before: before && !Number.isNaN(before.getTime()) ? before : undefined,
      limit,
    });

    return {
      items: result.items.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderUserId: m.senderUserId,
        body: m.body,
        readAt: m.readAt ? m.readAt.toISOString() : null,
        createdAt: m.createdAt.toISOString(),
      })),
      hasMore: result.hasMore,
    };
  }
}

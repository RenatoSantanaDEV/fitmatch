import { IConversationRepository } from '../../ports/output/IConversationRepository';
import { IMessageRepository } from '../../ports/output/IMessageRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IChatRealtimePort, buildMessagePayload } from '../../ports/output/IChatRealtimePort';
import { MessageDTO } from '../../dtos/chat/ChatDTO';
import {
  ConversationBlockedError,
  ConversationNotFoundError,
  EmptyMessageError,
  MessageTooLongError,
  NotAConversationParticipantError,
} from '../../../domain/errors/ChatErrors';
import { ConversationStatus } from '../../../domain/enums/ConversationStatus';
import {
  buildPreview,
  normalizeMessageBody,
  roleOfParticipant,
} from '../../../domain/rules/chatRules';
import { resolveRequester } from './resolveRequester';

export interface SendMessageInput {
  userId: string;
  conversationId: string;
  body: string;
}

export class SendMessageUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly messageRepo: IMessageRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly professionalRepo: IProfessionalRepository,
    private readonly chatRealtimePort: IChatRealtimePort,
  ) {}

  async execute(input: SendMessageInput): Promise<MessageDTO> {
    let body: string;
    try {
      body = normalizeMessageBody(input.body);
    } catch (err) {
      if (err instanceof Error && err.message === 'MESSAGE_TOO_LONG') {
        throw new MessageTooLongError();
      }
      throw new EmptyMessageError();
    }

    const conversation = await this.conversationRepo.findById(input.conversationId);
    if (!conversation) throw new ConversationNotFoundError(input.conversationId);

    const requester = await resolveRequester(
      input.userId,
      this.studentRepo,
      this.professionalRepo,
    );
    const senderRole = roleOfParticipant(conversation, requester);
    if (!senderRole) throw new NotAConversationParticipantError();

    if (conversation.status === ConversationStatus.BLOCKED) {
      throw new ConversationBlockedError();
    }

    const now = new Date();
    const preview = buildPreview(body);

    const message = await this.messageRepo.create({
      conversationId: conversation.id,
      senderUserId: input.userId,
      body,
    });

    await this.conversationRepo.updateOnNewMessage({
      conversationId: conversation.id,
      preview,
      sentByRole: senderRole,
      sentAt: now,
    });

    this.chatRealtimePort
      .publishMessage(
        buildMessagePayload(message, {
          studentId: conversation.studentId,
          professionalId: conversation.professionalId,
        }),
      )
      .catch(() => {});

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderUserId: message.senderUserId,
      body: message.body,
      readAt: message.readAt ? message.readAt.toISOString() : null,
      createdAt: message.createdAt.toISOString(),
    };
  }
}

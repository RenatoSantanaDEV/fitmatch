import { IConversationRepository } from '../../ports/output/IConversationRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IUserRepository } from '../../ports/output/IUserRepository';
import { ConversationDTO } from '../../dtos/chat/ChatDTO';
import {
  ConversationNotFoundError,
  NotAConversationParticipantError,
} from '../../../domain/errors/ChatErrors';
import { roleOfParticipant } from '../../../domain/rules/chatRules';
import { resolveRequester } from './resolveRequester';
import { resolveAvatarUrl } from '../../../lib/resolveAvatarUrl';

export interface GetConversationInput {
  userId: string;
  conversationId: string;
}

export class GetConversationUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly professionalRepo: IProfessionalRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: GetConversationInput): Promise<ConversationDTO> {
    const conversation = await this.conversationRepo.findById(input.conversationId);
    if (!conversation) throw new ConversationNotFoundError(input.conversationId);

    const requester = await resolveRequester(
      input.userId,
      this.studentRepo,
      this.professionalRepo,
    );
    const requesterRole = roleOfParticipant(conversation, requester);
    if (!requesterRole) throw new NotAConversationParticipantError();

    const counterpartRole = requesterRole === 'STUDENT' ? 'PROFESSIONAL' : 'STUDENT';
    let counterpartUserId: string;
    if (counterpartRole === 'PROFESSIONAL') {
      const professional = await this.professionalRepo.findById(conversation.professionalId);
      counterpartUserId = professional?.userId ?? '';
    } else {
      const student = await this.studentRepo.findById(conversation.studentId);
      counterpartUserId = student?.userId ?? '';
    }

    const counterpartInfo = counterpartUserId
      ? await this.userRepo.findNamesByIds([counterpartUserId])
      : new Map<string, { name: string; avatarUrl: string | null }>();
    const counterpart = counterpartInfo.get(counterpartUserId);

    return {
      id: conversation.id,
      studentId: conversation.studentId,
      professionalId: conversation.professionalId,
      fromMatchId: conversation.fromMatchId,
      status: conversation.status,
      lastMessageAt: conversation.lastMessageAt
        ? conversation.lastMessageAt.toISOString()
        : null,
      lastMessagePreview: conversation.lastMessagePreview,
      unreadForRequester:
        requesterRole === 'STUDENT' ? conversation.studentUnread : conversation.professionalUnread,
      requesterRole,
      counterpart: {
        userId: counterpartUserId,
        name: counterpart?.name ?? '',
        avatarUrl: resolveAvatarUrl(counterpartUserId, counterpart?.avatarUrl ?? null),
        role: counterpartRole,
      },
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    };
  }
}

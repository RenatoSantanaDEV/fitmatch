import { IConversationRepository } from '../../ports/output/IConversationRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import {
  ConversationNotFoundError,
  NotAConversationParticipantError,
} from '../../../domain/errors/ChatErrors';
import { ParticipantRole, roleOfParticipant } from '../../../domain/rules/chatRules';
import { resolveRequester } from './resolveRequester';

export class AuthorizeConversationAccessUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly professionalRepo: IProfessionalRepository,
  ) {}

  async execute(
    userId: string,
    conversationId: string,
  ): Promise<{
    role: ParticipantRole;
    studentId: string;
    professionalId: string;
  }> {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new ConversationNotFoundError(conversationId);

    const requester = await resolveRequester(
      userId,
      this.studentRepo,
      this.professionalRepo,
    );
    const role = roleOfParticipant(conversation, requester);
    if (!role) throw new NotAConversationParticipantError();

    return {
      role,
      studentId: conversation.studentId,
      professionalId: conversation.professionalId,
    };
  }
}

import { IConversationRepository } from '../../ports/output/IConversationRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import {
  ConversationNotFoundError,
  NotAConversationParticipantError,
} from '../../../domain/errors/ChatErrors';
import { roleOfParticipant } from '../../../domain/rules/chatRules';
import { resolveRequester } from './resolveRequester';

export interface MarkConversationReadInput {
  userId: string;
  conversationId: string;
}

export class MarkConversationReadUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly professionalRepo: IProfessionalRepository,
  ) {}

  async execute(input: MarkConversationReadInput): Promise<void> {
    const conversation = await this.conversationRepo.findById(input.conversationId);
    if (!conversation) throw new ConversationNotFoundError(input.conversationId);

    const requester = await resolveRequester(
      input.userId,
      this.studentRepo,
      this.professionalRepo,
    );
    const role = roleOfParticipant(conversation, requester);
    if (!role) throw new NotAConversationParticipantError();

    await this.conversationRepo.markRead(conversation.id, role, input.userId, new Date());
  }
}

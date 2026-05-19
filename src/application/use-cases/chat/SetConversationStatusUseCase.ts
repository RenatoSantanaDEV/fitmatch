import { IConversationRepository } from '../../ports/output/IConversationRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { ConversationStatus } from '../../../domain/enums/ConversationStatus';
import {
  ConversationNotFoundError,
  NotAConversationParticipantError,
} from '../../../domain/errors/ChatErrors';
import { roleOfParticipant } from '../../../domain/rules/chatRules';
import { resolveRequester } from './resolveRequester';
import { DomainError } from '../../../domain/errors/DomainError';

export interface SetConversationStatusInput {
  userId: string;
  conversationId: string;
  status: ConversationStatus;
}

export class SetConversationStatusUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly professionalRepo: IProfessionalRepository,
  ) {}

  async execute(input: SetConversationStatusInput): Promise<void> {
    const conversation = await this.conversationRepo.findById(input.conversationId);
    if (!conversation) throw new ConversationNotFoundError(input.conversationId);

    const requester = await resolveRequester(
      input.userId,
      this.studentRepo,
      this.professionalRepo,
    );
    const role = roleOfParticipant(conversation, requester);
    if (!role) throw new NotAConversationParticipantError();

    // Only the professional may BLOCK; either side may ARCHIVE/ACTIVE.
    if (input.status === ConversationStatus.BLOCKED && role !== 'PROFESSIONAL') {
      throw new DomainError('Only the professional can block this conversation');
    }

    await this.conversationRepo.setStatus(conversation.id, input.status);
  }
}

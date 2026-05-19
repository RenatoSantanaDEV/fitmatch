import { IConversationRepository } from '../../ports/output/IConversationRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IMatchRepository } from '../../ports/output/IMatchRepository';
import { IUserRepository } from '../../ports/output/IUserRepository';
import { ConversationDTO } from '../../dtos/chat/ChatDTO';
import { MatchStatus } from '../../../domain/enums/MatchStatus';
import {
  CannotChatWithSelfError,
  ProfessionalNotFoundError,
  StudentProfileRequiredError,
} from '../../../domain/errors/ChatErrors';
import { Conversation } from '../../../domain/entities/Conversation';
import { resolveAvatarUrl } from '../../../lib/resolveAvatarUrl';

export interface StartConversationInput {
  userId: string;
  professionalId: string;
}

export class StartConversationUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly professionalRepo: IProfessionalRepository,
    private readonly matchRepo: IMatchRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: StartConversationInput): Promise<ConversationDTO> {
    const professional = await this.professionalRepo.findById(input.professionalId);
    if (!professional) throw new ProfessionalNotFoundError(input.professionalId);

    if (professional.userId === input.userId) {
      throw new CannotChatWithSelfError();
    }

    const student = await this.studentRepo.findByUserId(input.userId);
    if (!student) throw new StudentProfileRequiredError();

    const activeMatch = await this.matchRepo.findActiveByStudentAndProfessional(
      student.id,
      professional.id,
    );
    const fromMatchId =
      activeMatch && activeMatch.status === MatchStatus.ACCEPTED ? activeMatch.id : null;

    const conversation = await this.conversationRepo.createOrGet({
      studentId: student.id,
      professionalId: professional.id,
      fromMatchId,
    });

    const counterpartInfo = await this.userRepo.findNamesByIds([professional.userId]);
    const counterpart = counterpartInfo.get(professional.userId);

    return toDTO(conversation, 'STUDENT', {
      userId: professional.userId,
      name: counterpart?.name ?? '',
      avatarUrl: resolveAvatarUrl(professional.userId, counterpart?.avatarUrl ?? null),
      role: 'PROFESSIONAL',
    });
  }
}

function toDTO(
  c: Conversation,
  requesterRole: 'STUDENT' | 'PROFESSIONAL',
  counterpart: ConversationDTO['counterpart'],
): ConversationDTO {
  return {
    id: c.id,
    studentId: c.studentId,
    professionalId: c.professionalId,
    fromMatchId: c.fromMatchId,
    status: c.status,
    lastMessageAt: c.lastMessageAt ? c.lastMessageAt.toISOString() : null,
    lastMessagePreview: c.lastMessagePreview,
    unreadForRequester: requesterRole === 'STUDENT' ? c.studentUnread : c.professionalUnread,
    requesterRole,
    counterpart,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

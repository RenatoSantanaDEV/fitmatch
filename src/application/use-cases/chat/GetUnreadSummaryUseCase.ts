import { IConversationRepository } from '../../ports/output/IConversationRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { resolveRequester } from './resolveRequester';

export class GetUnreadSummaryUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly professionalRepo: IProfessionalRepository,
  ) {}

  async execute(userId: string): Promise<{ totalUnread: number }> {
    const requester = await resolveRequester(
      userId,
      this.studentRepo,
      this.professionalRepo,
    );
    if (!requester.studentId && !requester.professionalId) {
      return { totalUnread: 0 };
    }
    const totalUnread = await this.conversationRepo.countUnreadForUser({
      studentId: requester.studentId,
      professionalId: requester.professionalId,
    });
    return { totalUnread };
  }
}

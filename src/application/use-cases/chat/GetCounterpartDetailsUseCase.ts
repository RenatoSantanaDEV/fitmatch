import { IConversationRepository } from '../../ports/output/IConversationRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { IUserRepository } from '../../ports/output/IUserRepository';
import { CounterpartDetailsDTO } from '../../dtos/chat/ChatDTO';
import {
  ConversationNotFoundError,
  NotAConversationParticipantError,
} from '../../../domain/errors/ChatErrors';
import { roleOfParticipant } from '../../../domain/rules/chatRules';
import { resolveRequester } from './resolveRequester';
import { resolveAvatarUrl } from '../../../lib/resolveAvatarUrl';

export interface GetCounterpartDetailsInput {
  userId: string;
  conversationId: string;
}

export class GetCounterpartDetailsUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly professionalRepo: IProfessionalRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: GetCounterpartDetailsInput): Promise<CounterpartDetailsDTO> {
    const conversation = await this.conversationRepo.findById(input.conversationId);
    if (!conversation) throw new ConversationNotFoundError(input.conversationId);

    const requester = await resolveRequester(
      input.userId,
      this.studentRepo,
      this.professionalRepo,
    );
    const requesterRole = roleOfParticipant(conversation, requester);
    if (!requesterRole) throw new NotAConversationParticipantError();

    if (requesterRole === 'STUDENT') {
      const professional = await this.professionalRepo.findById(conversation.professionalId);
      if (!professional) throw new NotAConversationParticipantError();
      const usersMap = await this.userRepo.findNamesByIds([professional.userId]);
      const userInfo = usersMap.get(professional.userId);
      return {
        role: 'PROFESSIONAL',
        userId: professional.userId,
        professionalId: professional.id,
        name: userInfo?.name ?? '',
        avatarUrl: resolveAvatarUrl(professional.userId, userInfo?.avatarUrl ?? null),
        bio: professional.bio,
        areas: professional.areas.map((a) => ({ id: a.id, nome: a.nome })),
        modalities: professional.modalities,
        yearsExperience: professional.yearsExperience,
        averageRating: professional.averageRating,
        totalReviews: professional.totalReviews,
        isVerified: professional.isVerified,
        sessionPrice: {
          min: professional.sessionPrice.min,
          max: professional.sessionPrice.max,
          currency: professional.sessionPrice.currency,
        },
        location: {
          city: professional.location.city,
          state: professional.location.state,
        },
        classDynamics: professional.classDynamics ?? null,
        sessionDurationMinutes: professional.sessionDurationMinutes ?? null,
      };
    }

    const student = await this.studentRepo.findById(conversation.studentId);
    if (!student) throw new NotAConversationParticipantError();
    const usersMap = await this.userRepo.findNamesByIds([student.userId]);
    const userInfo = usersMap.get(student.userId);
    return {
      role: 'STUDENT',
      userId: student.userId,
      name: userInfo?.name ?? '',
      avatarUrl: resolveAvatarUrl(student.userId, userInfo?.avatarUrl ?? null),
      bio: student.bio ?? null,
      fitnessGoals: student.fitnessGoals,
      experienceLevel: student.experienceLevel,
      preferredModality: student.preferredModality,
      preferredSpecializations: student.preferredSpecializations,
      preferredLocation: student.preferredLocation
        ? {
            city: student.preferredLocation.city ?? null,
            state: student.preferredLocation.state ?? null,
          }
        : null,
      budgetRange: student.budgetRange
        ? {
            min: student.budgetRange.min,
            max: student.budgetRange.max,
            currency: student.budgetRange.currency,
          }
        : null,
    };
  }
}

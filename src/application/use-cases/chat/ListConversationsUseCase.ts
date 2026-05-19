import { IConversationRepository } from '../../ports/output/IConversationRepository';
import { IStudentRepository } from '../../ports/output/IStudentRepository';
import { IProfessionalRepository } from '../../ports/output/IProfessionalRepository';
import { ConversationDTO, ConversationListDTO } from '../../dtos/chat/ChatDTO';
import { CHAT_LIMITS } from '../../../domain/rules/chatRules';
import { resolveRequester } from './resolveRequester';

export interface ListConversationsInput {
  userId: string;
  cursor?: string;
  limit?: number;
}

export class ListConversationsUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly studentRepo: IStudentRepository,
    private readonly professionalRepo: IProfessionalRepository,
  ) {}

  async execute(input: ListConversationsInput): Promise<ConversationListDTO> {
    const requester = await resolveRequester(
      input.userId,
      this.studentRepo,
      this.professionalRepo,
    );

    if (!requester.studentId && !requester.professionalId) {
      return { items: [], nextCursor: null, totalUnread: 0 };
    }

    const limit = Math.min(
      Math.max(input.limit ?? CHAT_LIMITS.CONVERSATIONS_PAGE_SIZE_DEFAULT, 1),
      CHAT_LIMITS.CONVERSATIONS_PAGE_SIZE_MAX,
    );

    const cursor = parseCursor(input.cursor);

    const result = await this.conversationRepo.listForUser({
      studentId: requester.studentId,
      professionalId: requester.professionalId,
      cursor,
      limit,
    });

    const items: ConversationDTO[] = result.items.map((item) => {
      const requesterRole = item.counterpart.role === 'STUDENT' ? 'PROFESSIONAL' : 'STUDENT';
      return {
        id: item.conversation.id,
        studentId: item.conversation.studentId,
        professionalId: item.conversation.professionalId,
        fromMatchId: item.conversation.fromMatchId,
        status: item.conversation.status,
        lastMessageAt: item.conversation.lastMessageAt
          ? item.conversation.lastMessageAt.toISOString()
          : null,
        lastMessagePreview: item.conversation.lastMessagePreview,
        unreadForRequester: item.unreadForRequester,
        requesterRole,
        counterpart: item.counterpart,
        createdAt: item.conversation.createdAt.toISOString(),
        updatedAt: item.conversation.updatedAt.toISOString(),
      };
    });

    return {
      items,
      nextCursor: result.nextCursor ? encodeCursor(result.nextCursor) : null,
      totalUnread: result.totalUnread,
    };
  }
}

function parseCursor(
  raw: string | undefined,
): { lastMessageAt: Date | null; id: string } | undefined {
  if (!raw) return undefined;
  try {
    const decoded = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded) as { t: string | null; id: string };
    if (!parsed?.id || typeof parsed.id !== 'string') return undefined;
    return {
      lastMessageAt: parsed.t ? new Date(parsed.t) : null,
      id: parsed.id,
    };
  } catch {
    return undefined;
  }
}

function encodeCursor(cursor: { lastMessageAt: Date | null; id: string }): string {
  const payload = JSON.stringify({
    t: cursor.lastMessageAt ? cursor.lastMessageAt.toISOString() : null,
    id: cursor.id,
  });
  return Buffer.from(payload, 'utf8').toString('base64url');
}

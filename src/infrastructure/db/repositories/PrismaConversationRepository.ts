import { Prisma, PrismaClient } from '@prisma/client';
import {
  ConversationListItem,
  CreateConversationInput,
  IConversationRepository,
  ListConversationsForUserParams,
  ListConversationsResult,
  UpdateOnNewMessageInput,
} from '../../../application/ports/output/IConversationRepository';
import { Conversation } from '../../../domain/entities/Conversation';
import { ConversationStatus } from '../../../domain/enums/ConversationStatus';
import { ParticipantRole, recipientRoleOf } from '../../../domain/rules/chatRules';
import { ConversationMapper } from '../mappers/ConversationMapper';

export class PrismaConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Conversation | null> {
    const raw = await this.prisma.conversation.findUnique({ where: { id } });
    return raw ? ConversationMapper.toDomain(raw) : null;
  }

  async findByParticipants(
    studentId: string,
    professionalId: string,
  ): Promise<Conversation | null> {
    const raw = await this.prisma.conversation.findUnique({
      where: {
        studentId_professionalId: { studentId, professionalId },
      },
    });
    return raw ? ConversationMapper.toDomain(raw) : null;
  }

  async createOrGet(input: CreateConversationInput): Promise<Conversation> {
    const raw = await this.prisma.conversation.upsert({
      where: {
        studentId_professionalId: {
          studentId: input.studentId,
          professionalId: input.professionalId,
        },
      },
      create: {
        studentId: input.studentId,
        professionalId: input.professionalId,
        fromMatchId: input.fromMatchId,
      },
      update: input.fromMatchId
        ? {
            fromMatchId: input.fromMatchId,
          }
        : {},
    });
    return ConversationMapper.toDomain(raw);
  }

  async listForUser(params: ListConversationsForUserParams): Promise<ListConversationsResult> {
    const where: Prisma.ConversationWhereInput = {
      status: { not: ConversationStatus.ARCHIVED },
      OR: [
        params.studentId ? { studentId: params.studentId } : undefined,
        params.professionalId ? { professionalId: params.professionalId } : undefined,
      ].filter(Boolean) as Prisma.ConversationWhereInput[],
    };

    if (params.cursor) {
      const cursorDate = params.cursor.lastMessageAt;
      const cursorOr: Prisma.ConversationWhereInput[] = cursorDate
        ? [
            { lastMessageAt: { lt: cursorDate } },
            { lastMessageAt: cursorDate, id: { lt: params.cursor.id } },
          ]
        : [{ id: { lt: params.cursor.id } }];
      where.AND = [{ OR: cursorOr }];
    }

    const rows = await this.prisma.conversation.findMany({
      where,
      orderBy: [{ lastMessageAt: 'desc' }, { id: 'desc' }],
      take: params.limit + 1,
      include: {
        student: { select: { userId: true } },
        professional: { select: { userId: true } },
      },
    });

    const hasMore = rows.length > params.limit;
    const slice = rows.slice(0, params.limit);

    const userIds = new Set<string>();
    for (const row of slice) {
      if (params.studentId === row.studentId) {
        userIds.add(row.professional.userId);
      } else if (params.professionalId === row.professionalId) {
        userIds.add(row.student.userId);
      } else {
        userIds.add(row.student.userId);
        userIds.add(row.professional.userId);
      }
    }

    const users =
      userIds.size === 0
        ? new Map<string, { name: string; avatarUrl: string | null }>()
        : new Map(
            (
              await this.prisma.user.findMany({
                where: { id: { in: Array.from(userIds) } },
                select: { id: true, name: true, avatarUrl: true },
              })
            ).map((u) => [u.id, { name: u.name, avatarUrl: u.avatarUrl ?? null }]),
          );

    const items: ConversationListItem[] = slice.map((row) => {
      const isStudentSide = params.studentId === row.studentId;
      const counterpartRole: 'STUDENT' | 'PROFESSIONAL' = isStudentSide
        ? 'PROFESSIONAL'
        : 'STUDENT';
      const counterpartUserId = isStudentSide ? row.professional.userId : row.student.userId;
      const userInfo = users.get(counterpartUserId);
      return {
        conversation: ConversationMapper.toDomain(row),
        counterpart: {
          userId: counterpartUserId,
          name: userInfo?.name ?? '',
          avatarUrl: userInfo?.avatarUrl ?? null,
          role: counterpartRole,
        },
        unreadForRequester: isStudentSide ? row.studentUnread : row.professionalUnread,
      };
    });

    const nextCursor = hasMore
      ? (() => {
          const last = slice[slice.length - 1];
          return last
            ? { lastMessageAt: last.lastMessageAt ?? null, id: last.id }
            : null;
        })()
      : null;

    const totalUnread = await this.countUnreadForUser({
      studentId: params.studentId,
      professionalId: params.professionalId,
    });

    return { items, nextCursor, totalUnread };
  }

  async updateOnNewMessage(input: UpdateOnNewMessageInput): Promise<void> {
    const recipientRole = recipientRoleOf(input.sentByRole);
    await this.prisma.conversation.update({
      where: { id: input.conversationId },
      data: {
        lastMessageAt: input.sentAt,
        lastMessagePreview: input.preview,
        status: ConversationStatus.ACTIVE,
        ...(recipientRole === 'STUDENT'
          ? { studentUnread: { increment: 1 } }
          : { professionalUnread: { increment: 1 } }),
      },
    });
  }

  async markRead(
    conversationId: string,
    readerRole: ParticipantRole,
    readerUserId: string,
    now: Date,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.conversation.update({
        where: { id: conversationId },
        data:
          readerRole === 'STUDENT'
            ? { studentUnread: 0 }
            : { professionalUnread: 0 },
      }),
      this.prisma.message.updateMany({
        where: {
          conversationId,
          readAt: null,
          senderUserId: { not: readerUserId },
        },
        data: { readAt: now },
      }),
    ]);
  }

  async setStatus(id: string, status: ConversationStatus): Promise<Conversation> {
    const raw = await this.prisma.conversation.update({
      where: { id },
      data: { status },
    });
    return ConversationMapper.toDomain(raw);
  }

  async countUnreadForUser(params: {
    studentId: string | null;
    professionalId: string | null;
  }): Promise<number> {
    if (!params.studentId && !params.professionalId) return 0;

    const aggregates = await this.prisma.conversation.aggregate({
      where: {
        status: { not: ConversationStatus.ARCHIVED },
        OR: [
          params.studentId
            ? { studentId: params.studentId, studentUnread: { gt: 0 } }
            : undefined,
          params.professionalId
            ? {
                professionalId: params.professionalId,
                professionalUnread: { gt: 0 },
              }
            : undefined,
        ].filter(Boolean) as Prisma.ConversationWhereInput[],
      },
      _sum: {
        studentUnread: true,
        professionalUnread: true,
      },
    });

    let total = 0;
    if (params.studentId) total += aggregates._sum.studentUnread ?? 0;
    if (params.professionalId) total += aggregates._sum.professionalUnread ?? 0;
    return total;
  }
}

import { Conversation } from '../../../domain/entities/Conversation';
import { ConversationStatus } from '../../../domain/enums/ConversationStatus';
import { ParticipantRole } from '../../../domain/rules/chatRules';

export interface ConversationListItem {
  conversation: Conversation;
  counterpart: {
    userId: string;
    name: string;
    avatarUrl: string | null;
    role: 'STUDENT' | 'PROFESSIONAL';
  };
  unreadForRequester: number;
}

export interface ListConversationsForUserParams {
  studentId: string | null;
  professionalId: string | null;
  cursor?: { lastMessageAt: Date | null; id: string } | undefined;
  limit: number;
}

export interface ListConversationsResult {
  items: ConversationListItem[];
  nextCursor: { lastMessageAt: Date | null; id: string } | null;
  totalUnread: number;
}

export interface CreateConversationInput {
  studentId: string;
  professionalId: string;
  fromMatchId: string | null;
}

export interface UpdateOnNewMessageInput {
  conversationId: string;
  preview: string;
  sentByRole: ParticipantRole;
  sentAt: Date;
}

export interface IConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  findByParticipants(studentId: string, professionalId: string): Promise<Conversation | null>;
  createOrGet(input: CreateConversationInput): Promise<Conversation>;
  listForUser(params: ListConversationsForUserParams): Promise<ListConversationsResult>;
  updateOnNewMessage(input: UpdateOnNewMessageInput): Promise<void>;
  markRead(
    conversationId: string,
    readerRole: ParticipantRole,
    readerUserId: string,
    now: Date,
  ): Promise<void>;
  setStatus(id: string, status: ConversationStatus): Promise<Conversation>;
  countUnreadForUser(params: {
    studentId: string | null;
    professionalId: string | null;
  }): Promise<number>;
}

import { ConversationStatus } from '../../../domain/enums/ConversationStatus';

export interface StartConversationDTO {
  professionalId: string;
}

export interface SendMessageDTO {
  body: string;
}

export interface SetConversationStatusDTO {
  status: ConversationStatus;
}

export interface ConversationCounterpartDTO {
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: 'STUDENT' | 'PROFESSIONAL';
}

export interface ConversationDTO {
  id: string;
  studentId: string;
  professionalId: string;
  fromMatchId: string | null;
  status: ConversationStatus;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadForRequester: number;
  requesterRole: 'STUDENT' | 'PROFESSIONAL';
  counterpart: ConversationCounterpartDTO;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListDTO {
  items: ConversationDTO[];
  nextCursor: string | null;
  totalUnread: number;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface MessageListDTO {
  items: MessageDTO[];
  hasMore: boolean;
}

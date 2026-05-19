import { Message } from '../../../domain/entities/Message';

export interface ChatRealtimePayload {
  type: 'message';
  conversationId: string;
  studentId: string;
  professionalId: string;
  message: {
    id: string;
    conversationId: string;
    senderUserId: string;
    body: string;
    createdAt: string;
    readAt: string | null;
  };
}

export interface IChatRealtimePort {
  publishMessage(payload: ChatRealtimePayload): Promise<void>;
}

export function buildMessagePayload(
  message: Message,
  participants: { studentId: string; professionalId: string },
): ChatRealtimePayload {
  return {
    type: 'message',
    conversationId: message.conversationId,
    studentId: participants.studentId,
    professionalId: participants.professionalId,
    message: {
      id: message.id,
      conversationId: message.conversationId,
      senderUserId: message.senderUserId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      readAt: message.readAt ? message.readAt.toISOString() : null,
    },
  };
}

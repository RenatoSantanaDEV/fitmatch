import { ConversationStatus } from '../enums/ConversationStatus';

export interface Conversation {
  readonly id: string;
  readonly studentId: string;
  readonly professionalId: string;
  readonly fromMatchId: string | null;
  readonly status: ConversationStatus;
  readonly lastMessageAt: Date | null;
  readonly lastMessagePreview: string | null;
  readonly studentUnread: number;
  readonly professionalUnread: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

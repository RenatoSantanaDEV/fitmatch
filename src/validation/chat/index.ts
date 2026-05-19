import { z } from 'zod';
import { ConversationStatus } from '../../domain/enums/ConversationStatus';

export const startConversationSchema = z.object({
  professionalId: z.string().min(1),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(4000),
});

export const setConversationStatusSchema = z.object({
  status: z.nativeEnum(ConversationStatus),
});

export type StartConversationInput = z.infer<typeof startConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SetConversationStatusInput = z.infer<typeof setConversationStatusSchema>;

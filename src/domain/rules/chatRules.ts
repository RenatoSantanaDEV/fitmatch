import { Conversation } from '../entities/Conversation';

export type ParticipantRole = 'STUDENT' | 'PROFESSIONAL';

const PREVIEW_MAX_LENGTH = 160;
const MESSAGE_MAX_LENGTH = 4000;

/**
 * Builds a single-line preview of a message body, suitable for the
 * conversation list. Collapses whitespace and trims to PREVIEW_MAX_LENGTH.
 */
export function buildPreview(body: string): string {
  const collapsed = body.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= PREVIEW_MAX_LENGTH) return collapsed;
  return `${collapsed.slice(0, PREVIEW_MAX_LENGTH - 1)}…`;
}

/**
 * Trims the message body and rejects empty / oversized messages.
 * Returns the sanitized value or throws via the provided factory.
 */
export function normalizeMessageBody(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    throw new Error('EMPTY_MESSAGE');
  }
  if (trimmed.length > MESSAGE_MAX_LENGTH) {
    throw new Error('MESSAGE_TOO_LONG');
  }
  return trimmed;
}

/**
 * Returns which side (student / professional) should have its unread counter
 * incremented when a message is sent by `senderRole`.
 */
export function recipientRoleOf(senderRole: ParticipantRole): ParticipantRole {
  return senderRole === 'STUDENT' ? 'PROFESSIONAL' : 'STUDENT';
}

/**
 * Pure authorization rule. Accepts the resolved IDs of the requester
 * (studentId / professionalId) — either may be null if the user does not
 * have that profile.
 */
export function isConversationParticipant(
  conversation: Pick<Conversation, 'studentId' | 'professionalId'>,
  requester: { studentId: string | null; professionalId: string | null },
): boolean {
  if (requester.studentId && requester.studentId === conversation.studentId) return true;
  if (requester.professionalId && requester.professionalId === conversation.professionalId)
    return true;
  return false;
}

export function roleOfParticipant(
  conversation: Pick<Conversation, 'studentId' | 'professionalId'>,
  requester: { studentId: string | null; professionalId: string | null },
): ParticipantRole | null {
  if (requester.studentId && requester.studentId === conversation.studentId) return 'STUDENT';
  if (requester.professionalId && requester.professionalId === conversation.professionalId)
    return 'PROFESSIONAL';
  return null;
}

export const CHAT_LIMITS = {
  PREVIEW_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  MESSAGES_PAGE_SIZE_DEFAULT: 30,
  MESSAGES_PAGE_SIZE_MAX: 100,
  CONVERSATIONS_PAGE_SIZE_DEFAULT: 20,
  CONVERSATIONS_PAGE_SIZE_MAX: 50,
};

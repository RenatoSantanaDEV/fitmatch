import { DomainError } from './DomainError';

export class ConversationNotFoundError extends DomainError {
  constructor(conversationId: string) {
    super(`Conversation not found: ${conversationId}`);
    this.name = 'ConversationNotFoundError';
  }
}

export class NotAConversationParticipantError extends DomainError {
  constructor() {
    super('You are not a participant of this conversation');
    this.name = 'NotAConversationParticipantError';
  }
}

export class ConversationBlockedError extends DomainError {
  constructor() {
    super('This conversation is blocked');
    this.name = 'ConversationBlockedError';
  }
}

export class EmptyMessageError extends DomainError {
  constructor() {
    super('Message body cannot be empty');
    this.name = 'EmptyMessageError';
  }
}

export class MessageTooLongError extends DomainError {
  constructor() {
    super('Message body is too long');
    this.name = 'MessageTooLongError';
  }
}

export class CannotChatWithSelfError extends DomainError {
  constructor() {
    super('You cannot start a chat with yourself');
    this.name = 'CannotChatWithSelfError';
  }
}

export class ProfessionalNotFoundError extends DomainError {
  constructor(professionalId: string) {
    super(`Professional not found: ${professionalId}`);
    this.name = 'ProfessionalNotFoundError';
  }
}

export class StudentProfileRequiredError extends DomainError {
  constructor() {
    super('Only students can start a conversation with a professional');
    this.name = 'StudentProfileRequiredError';
  }
}

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

export interface CounterpartLocationDTO {
  city: string | null;
  state: string | null;
}

export interface CounterpartPriceDTO {
  min: number;
  max: number;
  currency: string;
}

export interface StudentCounterpartDetailsDTO {
  role: 'STUDENT';
  userId: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  fitnessGoals: string[];
  experienceLevel: string;
  preferredModality: string;
  preferredSpecializations: string[];
  preferredLocation: CounterpartLocationDTO | null;
  budgetRange: CounterpartPriceDTO | null;
}

export interface ProfessionalCounterpartDetailsDTO {
  role: 'PROFESSIONAL';
  userId: string;
  professionalId: string;
  name: string;
  avatarUrl: string | null;
  bio: string;
  areas: { id: string; nome: string }[];
  modalities: string[];
  yearsExperience: number;
  averageRating: number | null;
  totalReviews: number;
  isVerified: boolean;
  sessionPrice: CounterpartPriceDTO;
  location: CounterpartLocationDTO;
  classDynamics: string | null;
  sessionDurationMinutes: number | null;
}

export type CounterpartDetailsDTO =
  | StudentCounterpartDetailsDTO
  | ProfessionalCounterpartDetailsDTO;

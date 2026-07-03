import { getPrismaClient } from '../infrastructure/db/prisma/client';
import { PrismaUserRepository } from '../infrastructure/db/repositories/PrismaUserRepository';
import { PrismaStudentRepository } from '../infrastructure/db/repositories/PrismaStudentRepository';
import { PrismaProfessionalRepository } from '../infrastructure/db/repositories/PrismaProfessionalRepository';
import { PrismaAvailabilityRepository } from '../infrastructure/db/repositories/PrismaAvailabilityRepository';
import { PrismaMatchRepository } from '../infrastructure/db/repositories/PrismaMatchRepository';
import { PrismaSessionRepository } from '../infrastructure/db/repositories/PrismaSessionRepository';
import { PrismaReviewRepository } from '../infrastructure/db/repositories/PrismaReviewRepository';
import { MatchingAdapterFactory } from '../infrastructure/ai/MatchingAdapterFactory';
import { NoopNotificationAdapter } from '../infrastructure/notifications/NoopNotificationAdapter';
import { RegisterUserUseCase } from '../application/use-cases/user/RegisterUserUseCase';
import { RegisterStudentAccountUseCase } from '../application/use-cases/user/RegisterStudentAccountUseCase';
import { RegisterProfessionalAccountUseCase } from '../application/use-cases/user/RegisterProfessionalAccountUseCase';
import { RequestMatchUseCase } from '../application/use-cases/match/RequestMatchUseCase';
import { ListMatchesUseCase } from '../application/use-cases/match/ListMatchesUseCase';
import { AcceptMatchUseCase } from '../application/use-cases/match/AcceptMatchUseCase';
import { BookSessionUseCase } from '../application/use-cases/session/BookSessionUseCase';
import { CancelSessionUseCase } from '../application/use-cases/session/CancelSessionUseCase';
import { CompleteSessionUseCase } from '../application/use-cases/session/CompleteSessionUseCase';
import { SubmitReviewUseCase } from '../application/use-cases/review/SubmitReviewUseCase';
import { ListProfessionalsUseCase } from '../application/use-cases/professional/ListProfessionalsUseCase';
import { SearchProfessionalsWithAiUseCase } from '../application/use-cases/professional/SearchProfessionalsWithAiUseCase';
import { PrismaStudentFavoriteRepository } from '../infrastructure/db/repositories/PrismaStudentFavoriteRepository';
import { PrismaConversationRepository } from '../infrastructure/db/repositories/PrismaConversationRepository';
import { PrismaMessageRepository } from '../infrastructure/db/repositories/PrismaMessageRepository';
import { PgNotifyChatAdapter } from '../infrastructure/realtime/PgNotifyChatAdapter';
import { StartConversationUseCase } from '../application/use-cases/chat/StartConversationUseCase';
import { SendMessageUseCase } from '../application/use-cases/chat/SendMessageUseCase';
import { ListConversationsUseCase } from '../application/use-cases/chat/ListConversationsUseCase';
import { GetConversationUseCase } from '../application/use-cases/chat/GetConversationUseCase';
import { ListMessagesUseCase } from '../application/use-cases/chat/ListMessagesUseCase';
import { MarkConversationReadUseCase } from '../application/use-cases/chat/MarkConversationReadUseCase';
import { SetConversationStatusUseCase } from '../application/use-cases/chat/SetConversationStatusUseCase';
import { GetUnreadSummaryUseCase } from '../application/use-cases/chat/GetUnreadSummaryUseCase';
import { AuthorizeConversationAccessUseCase } from '../application/use-cases/chat/AuthorizeConversationAccessUseCase';
import { GetCounterpartDetailsUseCase } from '../application/use-cases/chat/GetCounterpartDetailsUseCase';
import { PrismaBoostRepository } from '../infrastructure/db/repositories/PrismaBoostRepository';
import { PrismaProfileViewRepository } from '../infrastructure/db/repositories/PrismaProfileViewRepository';
import { StripePaymentAdapter } from '../infrastructure/payment/StripePaymentAdapter';
import { StartBoostCheckoutUseCase } from '../application/use-cases/boost/StartBoostCheckoutUseCase';
import { ActivateBoostUseCase } from '../application/use-cases/boost/ActivateBoostUseCase';
import { RecordProfileViewUseCase } from '../application/use-cases/professional/RecordProfileViewUseCase';
import { GetProfessionalInsightsUseCase } from '../application/use-cases/professional/GetProfessionalInsightsUseCase';
import { ListFeaturedProfessionalsUseCase } from '../application/use-cases/professional/ListFeaturedProfessionalsUseCase';
import { ListSimilarProfessionalsUseCase } from '../application/use-cases/professional/ListSimilarProfessionalsUseCase';
import { ListNearbyProfessionalsUseCase } from '../application/use-cases/professional/ListNearbyProfessionalsUseCase';
import { ListBestValueProfessionalsUseCase } from '../application/use-cases/professional/ListBestValueProfessionalsUseCase';

const prisma = getPrismaClient();

export const userRepo = new PrismaUserRepository(prisma);
export const studentRepo = new PrismaStudentRepository(prisma);
export const professionalRepo = new PrismaProfessionalRepository(prisma);
const availabilityRepo = new PrismaAvailabilityRepository(prisma);
const matchRepo = new PrismaMatchRepository(prisma);
const sessionRepo = new PrismaSessionRepository(prisma);
const reviewRepo = new PrismaReviewRepository(prisma);
export const studentFavoriteRepo = new PrismaStudentFavoriteRepository(prisma);
const conversationRepo = new PrismaConversationRepository(prisma);
const messageRepo = new PrismaMessageRepository(prisma);
const chatRealtimePort = new PgNotifyChatAdapter(prisma);
const matchingAdapter = MatchingAdapterFactory.create();
const notificationAdapter = new NoopNotificationAdapter();

export const registerUserUseCase = new RegisterUserUseCase(userRepo);

export const registerStudentAccountUseCase = new RegisterStudentAccountUseCase(prisma);
export const registerProfessionalAccountUseCase = new RegisterProfessionalAccountUseCase(prisma);

export const requestMatchUseCase = new RequestMatchUseCase(
  matchRepo,
  studentRepo,
  professionalRepo,
  matchingAdapter,
  notificationAdapter,
);

export const acceptMatchUseCase = new AcceptMatchUseCase(matchRepo, studentRepo);

export const listMatchesUseCase = new ListMatchesUseCase(
  matchRepo,
  studentRepo,
  professionalRepo,
  userRepo,
);

export const bookSessionUseCase = new BookSessionUseCase(
  sessionRepo,
  availabilityRepo,
  professionalRepo,
  studentRepo,
  notificationAdapter,
);

export const cancelSessionUseCase = new CancelSessionUseCase(sessionRepo, notificationAdapter);

export const completeSessionUseCase = new CompleteSessionUseCase(sessionRepo);

export const submitReviewUseCase = new SubmitReviewUseCase(reviewRepo, sessionRepo, professionalRepo);

export const listProfessionalsUseCase = new ListProfessionalsUseCase(professionalRepo, userRepo);

export const searchProfessionalsWithAiUseCase = new SearchProfessionalsWithAiUseCase(
  listProfessionalsUseCase,
);

export const startConversationUseCase = new StartConversationUseCase(
  conversationRepo,
  studentRepo,
  professionalRepo,
  matchRepo,
  userRepo,
);

export const sendMessageUseCase = new SendMessageUseCase(
  conversationRepo,
  messageRepo,
  studentRepo,
  professionalRepo,
  chatRealtimePort,
);

export const listConversationsUseCase = new ListConversationsUseCase(
  conversationRepo,
  studentRepo,
  professionalRepo,
);

export const getConversationUseCase = new GetConversationUseCase(
  conversationRepo,
  studentRepo,
  professionalRepo,
  userRepo,
);

export const listMessagesUseCase = new ListMessagesUseCase(
  conversationRepo,
  messageRepo,
  studentRepo,
  professionalRepo,
);

export const markConversationReadUseCase = new MarkConversationReadUseCase(
  conversationRepo,
  studentRepo,
  professionalRepo,
);

export const setConversationStatusUseCase = new SetConversationStatusUseCase(
  conversationRepo,
  studentRepo,
  professionalRepo,
);

export const getUnreadSummaryUseCase = new GetUnreadSummaryUseCase(
  conversationRepo,
  studentRepo,
  professionalRepo,
);

export const authorizeConversationAccessUseCase = new AuthorizeConversationAccessUseCase(
  conversationRepo,
  studentRepo,
  professionalRepo,
);

export const getCounterpartDetailsUseCase = new GetCounterpartDetailsUseCase(
  conversationRepo,
  studentRepo,
  professionalRepo,
  userRepo,
);

export const boostRepo = new PrismaBoostRepository(prisma);
export const profileViewRepo = new PrismaProfileViewRepository(prisma);
const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? '';
export const paymentAdapter = new StripePaymentAdapter(stripeSecretKey);

export const startBoostCheckoutUseCase = new StartBoostCheckoutUseCase(
  professionalRepo,
  boostRepo,
  paymentAdapter,
);

export const activateBoostUseCase = new ActivateBoostUseCase(boostRepo, professionalRepo);

export const recordProfileViewUseCase = new RecordProfileViewUseCase(professionalRepo, profileViewRepo);

export const getProfessionalInsightsUseCase = new GetProfessionalInsightsUseCase(
  professionalRepo,
  profileViewRepo,
  studentFavoriteRepo,
  matchRepo,
  sessionRepo,
  boostRepo,
);

export const listFeaturedProfessionalsUseCase = new ListFeaturedProfessionalsUseCase(professionalRepo, userRepo);

export const listSimilarProfessionalsUseCase = new ListSimilarProfessionalsUseCase(professionalRepo, userRepo);

export const listNearbyProfessionalsUseCase = new ListNearbyProfessionalsUseCase(professionalRepo, userRepo);

export const listBestValueProfessionalsUseCase = new ListBestValueProfessionalsUseCase(professionalRepo, userRepo);

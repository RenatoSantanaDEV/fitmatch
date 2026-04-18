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
import { RequestMatchUseCase } from '../application/use-cases/match/RequestMatchUseCase';
import { ListMatchesUseCase } from '../application/use-cases/match/ListMatchesUseCase';
import { AcceptMatchUseCase } from '../application/use-cases/match/AcceptMatchUseCase';
import { BookSessionUseCase } from '../application/use-cases/session/BookSessionUseCase';
import { CancelSessionUseCase } from '../application/use-cases/session/CancelSessionUseCase';
import { CompleteSessionUseCase } from '../application/use-cases/session/CompleteSessionUseCase';
import { SubmitReviewUseCase } from '../application/use-cases/review/SubmitReviewUseCase';
import { ListProfessionalsUseCase } from '../application/use-cases/professional/ListProfessionalsUseCase';

const prisma = getPrismaClient();

const userRepo = new PrismaUserRepository(prisma);
const studentRepo = new PrismaStudentRepository(prisma);
const professionalRepo = new PrismaProfessionalRepository(prisma);
const availabilityRepo = new PrismaAvailabilityRepository(prisma);
const matchRepo = new PrismaMatchRepository(prisma);
const sessionRepo = new PrismaSessionRepository(prisma);
const reviewRepo = new PrismaReviewRepository(prisma);
const matchingAdapter = MatchingAdapterFactory.create();
const notificationAdapter = new NoopNotificationAdapter();

export const registerUserUseCase = new RegisterUserUseCase(userRepo);

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

export const listProfessionalsUseCase = new ListProfessionalsUseCase(professionalRepo);

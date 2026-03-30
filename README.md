# FitMatch

A platform that connects fitness professionals — personal trainers, martial arts instructors, yoga teachers, pilates coaches, and more — with students looking for the right professional to meet their goals.

## Overview

FitMatch solves a real problem: finding the right fitness professional is hard. The platform uses artificial intelligence to analyze a student's profile (goals, experience level, preferred modality, location, and budget) and return the best matches ranked by relevance.

**Professionals** create verified profiles with specializations, certifications, and availability schedules.
**Students** describe their goals and receive AI-powered personalized recommendations.
**The AI** runs as a separate service and communicates with this platform through `IMatchingPort`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Database | Vercel Postgres (PostgreSQL) |
| ORM | Prisma 6 |
| Authentication | NextAuth v5 |
| Styling | Tailwind CSS v4 |
| Validation | Zod 4 |
| Deployment | Vercel |
| Node.js | >= 20.9.0 |

## Architecture

The project follows **Clean Architecture** in the **hexagonal (ports & adapters)** style. The domain core has zero external framework dependencies.

```
src/
├── domain/            # Entities, value objects, enums, errors, and pure business rules
├── application/       # Use cases + ports (input and output interfaces)
├── infrastructure/    # Prisma repositories, AI HTTP adapter, notifications, storage
├── container/         # Manual dependency injection (no IoC library)
├── validation/        # Zod schemas — only at the API boundary
└── app/               # Next.js App Router (route handlers + pages)
```

The AI matching service is isolated behind `IMatchingPort` at `src/application/ports/output/IMatchingPort.ts`. Swapping AI providers requires no changes to any use case.

### Domain Entities

`User` · `Student` · `Professional` · `Specialization` · `Certification` · `Availability` · `Match` · `Session` · `Review`

## Getting Started

### Prerequisites

- Node.js >= 20.9.0
- npm >= 10
- PostgreSQL database (local or Vercel Postgres)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd site

# Install dependencies (runs prisma generate automatically via postinstall)
npm install
```

### Environment Variables

Create a `.env` file at the project root:

```env
# Database
POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/fitconnect?schema=public"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/fitconnect?schema=public"

# NextAuth v5
AUTH_SECRET="generate with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# AI Matching API (separate repository)
AI_API_BASE_URL="http://localhost:8000"
AI_API_KEY="your-key"
AI_API_TIMEOUT_MS="10000"
```

### Database

```bash
# Create and apply migrations
npx prisma migrate dev --name init

# Open database UI (optional)
npx prisma studio
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Static analysis with ESLint |
| `npx tsc --noEmit` | TypeScript type check |
| `npx prisma migrate dev` | Apply migrations locally |
| `npx prisma migrate deploy` | Apply migrations in production |
| `npx prisma studio` | Visual database browser |

## Deploying to Vercel

### 1. Create the database

In the Vercel dashboard: **Storage → Create Database → Postgres**.
The `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` variables are injected automatically.

### 2. Set additional environment variables

Under **Settings → Environment Variables**, add:

```
AUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.vercel.app
AI_API_BASE_URL=https://your-ai-api-url
AI_API_KEY=<production-key>
```

### 3. Connect the repository

**New Project → Import Git Repository**. Vercel automatically builds and deploys on every push to the main branch.

### 4. Run migrations in production

After the first deploy, run once:

```bash
npx prisma migrate deploy
```

## Folder Structure

```
src/
├── domain/
│   ├── entities/          # User, Student, Professional, Match, Session, Review...
│   ├── value-objects/     # Location, Email, PhoneNumber, Rating, PriceRange, TimeSlot
│   ├── enums/             # UserRole, SessionStatus, MatchStatus, SpecializationType...
│   ├── errors/            # DomainError base class + context-specific errors
│   └── rules/             # Pure business rule functions (no side effects)
│
├── application/
│   ├── ports/
│   │   ├── input/         # Contracts exposed to driving adapters (API routes)
│   │   └── output/        # IUserRepository, IMatchingPort, INotificationPort...
│   ├── use-cases/         # RegisterUser, RequestMatch, BookSession, SubmitReview...
│   └── dtos/              # Data Transfer Objects per bounded context
│
├── infrastructure/
│   ├── db/
│   │   ├── prisma/        # PrismaClient singleton
│   │   ├── repositories/  # Prisma implementations of IRepository interfaces
│   │   └── mappers/       # Prisma model ↔ domain entity conversion
│   ├── ai/                # HttpMatchingAdapter → calls the AI API
│   ├── notifications/     # NoopNotificationAdapter (replace with Resend in prod)
│   └── storage/           # NoopStorageAdapter (replace with Vercel Blob in prod)
│
├── container/
│   └── index.ts           # Single instantiation point — manual DI wiring
│
├── validation/            # Zod schemas per domain context + shared atoms
│
└── app/
    ├── api/               # Route Handlers (driving adapters)
    │   ├── auth/          # NextAuth
    │   ├── users/
    │   ├── professionals/
    │   ├── matches/
    │   ├── sessions/
    │   └── reviews/
    └── (route groups)     # (public), (auth), (student), (professional), (admin)
```

## Core Business Rules

- A professional must have at least one specialization before accepting clients
- `isVerified` can only be set to `true` by an ADMIN after reviewing certifications
- A match expires after 7 days; matches with a score below 0.5 are not shown to students
- A session can only be cancelled with status `PENDING` or `CONFIRMED`
- Cancellations within 24 hours of the session start require a reason
- A review can only be submitted after the session status is `COMPLETED`
- Only one review is allowed per session; the professional's `averageRating` is updated in the same operation

## AI Matching Service

The AI-powered matching service lives in a separate repository. The contract between the two systems is defined by:

```typescript
// src/application/ports/output/IMatchingPort.ts
interface IMatchingPort {
  findMatches(request: MatchingRequest): Promise<MatchingResult[]>
}
```

## License

Academic project — Bachelor's Final Project (TCC).

# FitMatch

A platform that connects fitness professionals — personal trainers, martial arts instructors, yoga teachers, pilates coaches, and more — with students looking for the right professional to meet their goals.

## Overview

FitMatch solves a real problem: finding the right fitness professional is hard. The platform uses artificial intelligence to analyze a student's profile (goals, experience level, preferred modality, location, and budget) and return the best matches ranked by relevance.

**Professionals** create verified profiles with specializations, certifications, and availability schedules.
**Students** describe their goals and receive AI-powered personalized recommendations.
**The AI** runs in-process via a provider-agnostic adapter that talks to any
OpenAI-compatible endpoint (OpenAI, xAI Grok, Groq, ...). The domain pre-filters
candidates by hard rules (modality, remote/in-person compatibility, budget,
specialization overlap) and the LLM is used only to rank and justify. A
deterministic heuristic adapter is used automatically when no API key is set.

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

# AI Matching — any OpenAI-compatible endpoint. Leave AI_API_KEY empty to
# use the built-in heuristic adapter (no external calls, free).
AI_PROVIDER="openai"                          # openai | xai | groq | heuristic
AI_API_BASE_URL="https://api.openai.com/v1"   # https://api.x.ai/v1 (Grok) · https://api.groq.com/openai/v1 (Groq)
AI_API_KEY=""                                 # sk-... (OpenAI) · xai-... (Grok) · gsk_... (Groq)
AI_MODEL="gpt-4o-mini"                        # grok-2-latest · llama-3.3-70b-versatile · ...
AI_API_TIMEOUT_MS="15000"
```

### Database

```bash
# Create and apply migrations
npx prisma migrate dev --name init

# Seed prototype data (1 student + 6 varied professionals)
npm run db:seed

# Open database UI (optional)
npx prisma studio
```

After seeding, the script prints the generated `studentId`. Open
`http://localhost:3000/matches?studentId=<id>` to try the AI matching end-to-end.

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
| `npm run db:seed` | Populate DB with prototype data (1 student + 6 professionals) |
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
AI_PROVIDER=openai
AI_API_BASE_URL=https://api.openai.com/v1
AI_API_KEY=<production-key>
AI_MODEL=gpt-4o-mini
AI_API_TIMEOUT_MS=15000
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

The matching engine runs in-process as an implementation of `IMatchingPort`.
Two adapters live behind the port:

- `LLMMatchingAdapter` — provider-agnostic; talks to any OpenAI-compatible
  `/chat/completions` endpoint with Structured Outputs (JSON Schema). Switching
  from ChatGPT to Grok or Groq is just changing `AI_API_BASE_URL` + `AI_MODEL`.
- `HeuristicMatchingAdapter` — deterministic fallback used automatically when
  `AI_API_KEY` is empty or `AI_PROVIDER=heuristic`. No external calls, free.

The factory in `src/infrastructure/ai/MatchingAdapterFactory.ts` picks one at
runtime. The port contract is:

```typescript
// src/application/ports/output/IMatchingPort.ts
interface IMatchingPort {
  findMatches(request: MatchingRequest): Promise<MatchingResult[]>
}
```

Use case flow (retrieval + rerank):

1. `RequestMatchUseCase` pulls a broad pool of accepting professionals from
   `IProfessionalRepository.list()`.
2. `prefilterCandidates()` in `src/domain/rules/matchingRules.ts` applies hard
   rules — modality (online/in-person/hybrid), same-city for in-person,
   specialization overlap, budget intersection, accepting clients.
3. The adapter ranks the survivors, produces a 0.0–1.0 score and a short
   Portuguese justification per match.
4. Matches with score < 0.5 are hidden (`shouldDisplayMatch`).

The LLM "training" for the prototype happens via the system prompt in
`src/infrastructure/ai/prompts/matchSystemPrompt.md` — iterating on behavior
does not require a rebuild.

## License

Academic project — Bachelor's Final Project (TCC).

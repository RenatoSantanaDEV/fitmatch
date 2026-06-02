# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev            # start dev server
npm run build          # prisma generate + next build
npm run lint           # eslint
npm run test           # vitest run (all tests, no watch)
npm run test:watch     # vitest in watch mode
npx vitest run src/__tests__/ActivateBoostUseCase.test.ts  # single test file
npm run db:migrate     # prisma migrate dev (local)
npm run db:seed        # seed base data
npm run db:seed:professionals  # seed professional profiles
```

## Next.js 15 / React 19 — breaking changes

- `searchParams` and `params` in page/layout components are **Promises** — always `await` them.
- `cookies()` and `headers()` from `next/headers` are async.
- POST routes are dynamic by default; explicit `export const dynamic = 'force-dynamic'` is only needed on GET routes that must not be statically cached.
- Auth is **NextAuth v5** (`next-auth@^5.0.0-beta`): use `auth()` from `src/lib/auth.ts`, not `getServerSession`.
- Zod is **v4**: use `.issues` instead of `.errors` on parse results.

## Architecture

Hexagonal (ports & adapters) architecture inside a Next.js App Router monolith.

```
src/
  domain/           # entities, enums, value-objects, DomainError — no external deps
  application/      # use cases + port interfaces (input/output)
  infrastructure/   # adapter implementations (Prisma, Stripe, AI, storage, realtime)
  container/        # single index.ts — wires everything via constructor injection
  app/              # Next.js pages and API routes — thin, delegates to use cases
  validation/       # Zod schemas for API request bodies (separate from domain)
  lib/              # shared utilities (auth, apiResponse, cn, rateLimit, etc.)
  components/       # React components
```

**Dependency flow:** `app/api/*` → `container` → use cases → port interfaces ← infrastructure adapters.

API routes never import infrastructure directly. `src/container/index.ts` is the only place that instantiates concrete adapters.

## Key patterns

**API responses** — use helpers from `src/lib/apiResponse.ts`: `ok`, `created`, `badRequest`, `unauthorized`, `forbidden`, `handleError`. `handleError` maps `DomainError` → 422, everything else → 500.

**Domain errors** — throw `DomainError` (from `src/domain/errors/DomainError.ts`) from use cases for business rule violations.

**Validation** — Zod schemas in `src/validation/` validate API request bodies. Use cases receive typed inputs and do not re-validate.

**Auth** — call `auth()` from `src/lib/auth.ts` in route handlers. Session exposes `user.id`, `user.role`, `user.email`. Route-level protection lives in `src/middleware.ts`; add new public routes to `PUBLIC_PATHS` there.

**Real-time chat** — `PgNotifyChatAdapter` publishes via `pg_notify` on the `chat_msg` channel, reusing the Prisma connection pool. Payloads over ~7900 bytes drop the message body and force consumers to re-fetch via REST.

## AI matching

`MatchingAdapterFactory.create()` picks the adapter at startup:
- `AI_API_KEY` set + `AI_PROVIDER` ≠ `"heuristic"` → `LLMMatchingAdapter` (any OpenAI-compatible endpoint — configure with `AI_API_BASE_URL`, `AI_MODEL`)
- Otherwise → `HeuristicMatchingAdapter` (no external deps)

Use cases depend only on `IMatchingPort`; swapping providers is a config-only change.

## Boost / payments (Stripe)

`POST /api/boosts/checkout` → `StartBoostCheckoutUseCase` creates a Stripe Checkout session and saves a `PENDING` `ProfessionalBoost` row → Stripe redirects to `/boost/sucesso?session_id=...` → Stripe webhook `POST /api/webhooks/stripe` → `ActivateBoostUseCase` sets status `ACTIVE` and writes `boostTier`/`boostExpiresAt` to the professional.

Boost activation is entirely webhook-driven. The success page is presentational only and redirects to `/perfil#impulso` if `session_id` is absent.

## Environment variables

Required at runtime (not needed to build):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | NextAuth signing secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

Optional:

| Variable | Purpose |
|---|---|
| `AI_API_KEY` / `AI_API_BASE_URL` / `AI_MODEL` / `AI_PROVIDER` | LLM matching |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth |
| `AUTH_FACEBOOK_ID` / `AUTH_FACEBOOK_SECRET` | Facebook OAuth |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` / `GOOGLE_MAPS_SERVER_API_KEY` | Maps |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage (avatars, certificates) |

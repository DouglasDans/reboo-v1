# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Reboo is a PWA for personal book tracking (organize libraries, collections, reading sessions, stats). Yarn workspaces monorepo with two apps:

- `apps/backend` — NestJS 10 + Prisma 5 + PostgreSQL, JWT auth
- `apps/frontend` — Next.js 14 (App Router) + React 18, SASS modules, axios

## Commands

Run from the repo root (scripts delegate to the workspace via `yarn workspace`):

```bash
yarn backend:dev          # nest start --watch
yarn backend:test         # jest (unit tests, *.test.ts colocated with source)
yarn backend:test:cov     # jest --coverage
yarn frontend:dev         # next dev
yarn frontend:test        # next lint (there is no frontend test suite — this is lint)
yarn frontend:build
```

Docker (primary way this project is actually run/developed):

```bash
yarn docker:dev:build     # build + up with file watch, backend :8080, frontend :3000, postgres :5432, pgadmin :5050
yarn docker:test:build
yarn docker:prod:build
```

Inside `apps/backend` directly:

```bash
yarn test:e2e                       # jest --config ./test/jest-e2e.json
node --inspect-brk ... jest --runInBand   # yarn test:debug
yarn migrate                        # prisma migrate dev
yarn generate                       # prisma generate
yarn studio                         # prisma studio
```

To run a single backend test file: `yarn workspace backend jest path/to/file.test.ts`.

Each app needs its own `.env` (see `apps/backend/.env.example`, `apps/frontend/.env.example`) — not committed.

## Backend architecture (`apps/backend/src`)

Clean Architecture, strictly layered. When adding a feature, touch all four layers in this order:

1. **`core/entities`** — plain domain models (e.g. `Book`, `Collection`). **`core/dtos`** — `class-validator`/`class-transformer` DTOs for create/update. **`core/repositories`** — abstract classes declaring the repository contract (e.g. `BookRepository`), never implementations.
2. **`frameworks/data-services/prisma/repositories`** — Prisma-backed implementations of the abstract repositories (e.g. `PrismaBookRepository`). This is the only layer that imports `PrismaService`/the Prisma client.
3. **`use-cases/<feature>`** — one folder per domain feature (`book`, `collection`, `reading-session`, `auth`, etc.), each with its own NestJS module. A use-case module wires its service to the Prisma repository via the `provide: XRepository, useClass: PrismaXRepository` pattern (see `use-cases/book/book.use-case.module.ts`) and imports other use-case modules it depends on (e.g. `BookUseCaseModule` imports `PublisherUseCaseModule`, `BookAuthorUseCaseModule`). Services under this layer hold business logic; some features also have a `*.factory.service.ts` for entity construction (see `book.factory.service.ts`).
4. **`controllers`** — one controller per feature, thin, delegates to the use-case service. All registered together in `app.module.ts`.

Cross-cutting:
- **Auth**: `AuthGuard` (`use-cases/auth/auth.guard.ts`) is registered globally as `APP_GUARD` in `app.module.ts` — every route requires a valid JWT by default. Mark a route public with the `@Public()` decorator (backed by `IS_PUBLIC_KEY` in `src/utils/decorators`), not by removing the guard.
- Many-to-many relations (`BookAuthor`, `BookCategory`, `BookCollection`) each get their own thin use-case module/service to manage the join table, called from the owning feature's service (e.g. `BookService` calls `bookAuthorService`, `bookCategoryService`, `bookCollectionService`).
- `select` query params on list endpoints are comma-separated strings split into arrays before hitting the repository (see `BookService.getAll`).

Backend unit tests are colocated as `*.test.ts` next to the file they cover (not in a separate `test/` tree — that directory is reserved for e2e specs).

## Frontend architecture (`apps/frontend/src`)

Next.js App Router with routes nested under the dynamic `[userId]` segment (`app/[userId]/dashboard`, `app/[userId]/library`, `app/[userId]/stats`), plus top-level `login`, `register`, `logout`.

- **`middleware.ts`** enforces auth at the edge: reads the `access_token` cookie, decodes it with `jose` (`lib/jwt.control.ts`), redirects to `/logout` on missing/expired/invalid tokens, and 404s if the JWT's `userId` doesn't match the `[userId]` route segment being accessed. Don't rely on client-side checks alone for route protection — this is the actual gate.
- **`api/reboo-api`** — the backend API client. `api.config.ts` creates a shared axios instance that attaches the `access_token` cookie as a Bearer token on every request (server-side, via `next/headers`) and unwraps `response.data`/`error.response.data` in interceptors, so callers get raw payloads, not the axios envelope. `services/*.service.ts` group endpoints per resource.
- **`api/GoogleBooksAPI`** — separate external API client used for ISBN/manual book search when adding a book.
- **`actions/*.action.ts`** — Next.js Server Actions (`"use server"`) that call the `reboo-api` services, translate form/UI shapes into API request DTOs (see `cleanAndSplit`/`extractIsbn` helpers in `book.action.ts` for comma-separated author/category/ISBN fields), and `redirect()` on success.
- **`containers/`** hold page-level composition (often split into numbered `step1`/`step2`/`step3` for multi-step forms like add/edit book and add collection); **`components/`** hold reusable presentational pieces; **`context/`** holds React context providers (`user`, `book`, `tabbed-menu-layout`).
- Styling is SASS (`.scss` modules), not a utility-CSS framework.

There is no automated frontend test suite yet (`src/tests/` is empty; `yarn frontend:test` just runs lint).

## Formatting

Backend and frontend use **different** Prettier configs — don't cross-apply:
- Backend (`apps/backend/.prettierrc`): `semi: false`, single quotes, `tabWidth: 2`.
- Frontend (`apps/frontend/.prettierrc`): `semi: false`, **double** quotes, `arrowParens: "avoid"`, `printWidth: 85`.

Both run through workspace-local ESLint (`yarn backend:test`/lint is separate from `frontend:test`, which *is* lint — see Commands).

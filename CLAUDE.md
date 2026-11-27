@AGENTS.md

# Gaia Garden Web

Frontend + BFF for Gaia Garden, an IoT platform for monitoring indoor cultivation.
Flow: **Browser → Next.js (`/api/*` BFF) → NestJS backend**. NestJS owns business logic, persistence, auth and authorization.

## Commands
- `pnpm dev`: start the dev server
- `pnpm build`: production build (run it to type-check)
- `pnpm lint`: ESLint
- `pnpm test`: Vitest unit tests (`src/**/*.test.ts`). Verify changes with `pnpm lint`, `pnpm build` and `pnpm test`.

## Stack
Next.js 16.3 (App Router), React 19.2, TypeScript 5 (strict), Tailwind CSS v4, Zod 4, pnpm. Path alias: `@/*` → `src/*`. Write all new UI text in **English** (ADR-004). There are pt-BR leftovers in the code; translate them only when the task covers them.

## Critical rules
- **The BFF only forwards requests.** Route handlers in `src/app/api/` must never contain business logic, access a database or compute domain data (for example, the backend calculates VPD). They may only:
  - read the session and attach the user's JWT as a Bearer token (every route, telemetry included; API keys are for IoT devices only and never used here)
  - validate and shape the input with Zod before sending it
  - map backend responses and errors for the UI
- The browser never calls NestJS directly. Client code calls `/api/*` only.
- Never store tokens in localStorage or sessionStorage, and never expose server env vars (`GAIA_GARDEN_API_URL`) to client components.
- `proxy.ts` (Next 16's replacement for `middleware.ts`) only does an optimistic session check. It is not the authorization boundary.
- Don't guess backend contracts, env vars or business rules. Read the existing code or ask.
- Make the smallest correct change and avoid unrelated refactors.
- **Ownership comes from the JWT** (checked in NestJS). Route handlers never accept `habitatId` or `userId` from the request body; they come from route params only.
- **Client calls use `api` / `apiJson`** from `src/lib/api/clientFetch.ts`, never raw `fetch`, so a 401 ends the session and redirects to login. The only exception is the login page: there a 401 means wrong credentials, not an expired session.
- **Validate everything in the BFF with Zod**:
  - IDs are positive integers parsed from digit-only strings. Don't use `parseInt`, which accepts `"12abc"`.
  - Request bodies use `.strict()` schemas.
  - Validation errors return `400 { message: "Validation failed", details }`.
- The platform is **plant-agnostic** (ADR-003). Use generic names in the UI (plant, habitat, stage, variety), never crop-specific ones.

## Architecture
- `src/lib/api/httpClient.ts`: generic transport only (no auth, no domain knowledge). It throws `APIClientError` or `NetworkError` from `errors.ts`.
- `src/lib/api/<domain>Client.ts`: one typed client per backend resource (`authClient`, `habitatClient`, `eventsClient`, `telemetryClient`, `plantsClient`, `plantLogsClient`). The caller passes the token explicitly.
- `src/lib/api/withSession.ts`: wraps every protected route handler. A missing session or a NestJS 401 returns 401 and clears the cookie. Other errors, 403 included, go through `errorResponse` (`routeErrors.ts`) with the backend status.
- `src/lib/api/clientFetch.ts`: the browser-side `api` / `apiJson` helpers. A 401 runs `endSession` once (it clears the cookie and does a full page load to `/login?redirect=…&reason=session_expired`) and throws `SessionExpiredError`; callers ignore that error. A 403 throws `ForbiddenError` and the user **stays logged in**: it means "not allowed", not "not authenticated". Don't change 403 to log the user out.
- `src/proxy.ts`: it must sit next to `app/`, which is why it lives in `src/` and not at the repo root. It checks the `gaia_session` cookie. Public routes are `/` and `/login`. Anyone else without a session is sent to `/login?redirect=<path>`.
- `src/lib/auth/session.ts`: the HttpOnly cookie `gaia_session` (`{ token, user }`, 24h).
- `src/lib/context/`: `UserContext` (profile, logout), `HabitatContext` (habitats plus the selected habitat, which scopes every page) and `SidebarContext`.
- `src/app/(public)/`: landing and login. `src/app/(protected)/`: dashboard, plants, events and telemetry, inside the Sidebar/Header/Footer layout.

## Entities
- **User** `{ id, username, email? }`: login, profile and logout via `/api/auth/*`.
- **Habitat** `{ id, title, description|null, userId, createdAt, updatedAt }`: a list endpoint only (`GET /api/habitat`).
- **Event** `{ id, description, habitatId, createdAt, updatedAt }`: CRUD at `/api/habitat/:habitatId/events[/:eventId]`.
- **Telemetry** `{ id, habitatId, temperature, humidity, vpd, recordedAt, createdAt }`:
  - Read the latest reading with `GET /api/telemetry/:habitatId/last`. It returns `{ data }`, and a backend 404 becomes `{ data: null }`.
  - Read the VPD history with `GET /api/habitat/:habitatId/telemetry/series?range=24h|7d|30d&tz=<IANA>`. The BFF turns the preset into `from`/`to` (`rangeToWindow` in `src/lib/schemas/telemetry.ts`) and the backend picks the bucket (`hour`/`day`). It returns `{ habitatId, metric, bucket, from, to, tz, points: [{ bucketStart, avg, min, max, count }] }`. The dashboard's `VpdChart` uses it.
  - Record a manual reading with `POST /api/habitat/:habitatId/telemetry` (`{ temperature, humidity }`, strict). The BFF sends the user's JWT and the param habitat to NestJS `POST /telemetry`, which checks ownership (404 otherwise) and computes the VPD. The `(protected)/telemetry` page uses the habitat selected in the header.
- **Plant** `{ id, name, description|null, variety|null, germinatedAt|null, seedlingAt|null, vegetativeAt|null, floweringAt|null, habitatId, createdAt, updatedAt }`: CRUD at `/api/habitat/:habitatId/plants[/:plantId]`. DELETE is a soft delete and returns 204.
  - The backend still names the field `strain`. `src/lib/api/plantMapper.ts` (BFF only) maps it to `variety`, so `strain` never reaches the UI.
  - Schemas are in `src/lib/schemas/plant.ts`. Create needs `name`, `description` and `variety`; `germinatedAt`/`seedlingAt` are optional `YYYY-MM-DD` dates, sent as UTC midnight. Update is partial, and the backend rejects `null`.
  - Pages: `(protected)/plants` (grid) and `(protected)/plants/[plantId]` (detail + diary).
- **PlantLog** (the plant diary) `{ id, plantId, type, notes|null, healthScore|null, occurredAt, createdAt, updatedAt }`: at `/api/habitat/:habitatId/plants/:plantId/logs[/:logId]`, with GET (`?from=&to=&type=`), POST, PATCH and DELETE (soft delete, 204).
  - `type` is one of the backend's enum values (`OBSERVATION`, `WATERING`, `FEEDING`, …). Only `OBSERVATION` can be created today; it needs notes and/or a `healthScore` from 1 to 5.
  - A PATCH can change `notes`, `healthScore` and `occurredAt`, but never `type` or `details`. The backend rejects `null`, so fields can't be cleared.
  - `occurredAt` is ISO 8601 with an offset. The backend enforces "not in the future".
  - Schemas are in `src/lib/schemas/plantLog.ts` and the mapping is in `src/lib/api/plantLogMapper.ts`. To support a new log type, add a schema member, a `KnownPlantLog` member and an entry in `plants/_components/diary/logTypes.tsx`.

## Patterns for new features
- **New backend resource:** follow the `new-bff-resource` skill (`.claude/skills/new-bff-resource/`). Summary:
  1. a typed client
  2. shared Zod schemas in `src/lib/schemas/`
  3. route handlers (session → validate → client → `{ message, details }` errors)
  4. a page in `(protected)/` driven by `useHabitat()`
  5. a Sidebar link
- **Any page or component:** follow the `ui-patterns` skill (tokens, page states, modals and a11y, grids, date formatting).
- Server Components are the default. Add `"use client"` only when the component needs interactivity or browser APIs.
- Don't cache user-specific data, and don't add a state-management library unless the task needs one.
- Styling: Tailwind with the theme tokens in `globals.css` (`gaia-bg`, `gaia-greenDeep`, `gaia-greenMint`, `gaia-greenSignal`, `gaia-alert-*`, …). Never hardcode new colors.
- Split big pages into `_components/` next to the route. Don't build 500-line single-file pages.

## Claude Code setup (`.claude/`)
- Skills: `new-bff-resource` and `ui-patterns`.
- Subagent: `bff-reviewer` (read-only). **Run it on your diff before you report a feature as done.**
- Hooks (`.claude/settings.json`):
  - After every edit, ESLint (`--fix`) runs on the file you changed. Fix any errors it reports.
  - Reading `.env*` (except `.env.example`) is blocked, and so is editing `node_modules/`, `.next/` or the lockfiles.
- For a non-trivial task, show a plan before you write code.

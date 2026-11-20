---
name: new-bff-resource
description: Step-by-step recipe to expose a NestJS backend resource in the web app (typed client, Zod schema, BFF route handlers, protected page, sidebar link). Use when adding a new entity/CRUD to gaia-garden-web, e.g. plants, API keys, habitats CRUD.
---

# New BFF resource (gaia-garden-web)

Use this when a backend resource exists in NestJS and the UI needs to read or write it.
The reference implementation is **events** (`src/lib/api/eventsClient.ts`,
`src/app/api/habitat/[habitatId]/events/**`, `src/app/(protected)/events/page.tsx`),
but **don't copy its weak spots**. In the events page:
- raw `fetch` is used instead of `apiJson`
- `parseInt` is used for IDs
- the page is one 500-line file
- the modals have no accessibility attributes

## 0. Confirm the contract first
- Read the backend controller/DTOs, or ask the user for them. Write down the method, path, body, response and error codes.
- Never invent an endpoint, field or rule. If anything is unknown, stop and write `[NEEDS CONFIRMATION]`.
- Read `node_modules/next/dist/docs/` for any Next API you'll touch (route handler signature, `params`, `PageProps`, `useRouter`).

## 1. Typed client: `src/lib/api/<domain>Client.ts`
- Model the **backend** shape exactly (field names as NestJS returns them). Dates are `string`.
- One function per operation. The token is the first argument. Use `httpClient` underneath. No session logic and no domain logic.
- If the UI name differs from the backend name (e.g. `variety` ↔ `strain`), add a mapper in `src/lib/api/<domain>Mapper.ts`. The BFF is the only layer that knows both names.

## 2. Shared Zod schemas: `src/lib/schemas/<domain>.ts`
- Create and update schemas, used by **both** the form (client) and the route handler (server).
- Use `.trim()`, `.min()` and `.max()` on strings. Mark objects `.strict()` so unknown keys (e.g. `habitatId`, `userId`) are rejected.
- Add an ID param schema: `z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive())`.
- Date inputs: accept `YYYY-MM-DD` and convert to ISO at UTC midnight in the BFF.

## 3. Route handlers: `src/app/api/.../route.ts`
Every handler follows the template in [route-template.md](route-template.md):
1. `getSession()`. If there's no token, return `401 { message: "Unauthorized" }`.
2. `await params` (a Promise in Next 16) and validate the IDs. If invalid, return `400 { message: "Invalid <x> ID" }`.
3. Parse the body with the Zod schema. On a `ZodError`, return `400 { message: "Validation failed", details: error.issues }`.
4. Call the client with `session.token`. Map the response for the UI if needed.
5. On `APIClientError`, return `{ message, details }` with the **original** status. Anything else gets a `console.error` (no token, no session) and `500 { message: "Internal server error" }`.

Never take `habitatId` or `userId` from the body. They come from the route param, and ownership from the JWT in NestJS.
No business logic: no computing, deriving or enforcing domain rules. That belongs in NestJS.

## 4. UI: `src/app/(protected)/<domain>/`
- Read `selectedHabitatId` from `useHabitat()`. Handle `null` (no habitat selected).
- Make every client call through `apiJson` / `api` from `@/lib/api/clientFetch` (401/403 auto-logout).
- Use an `AbortController` per fetch. Abort it when the habitat changes or the component unmounts, and close open modals when the habitat changes.
- Split components into `_components/` (Grid/List, Card, FormModal, DeleteDialog). Keep `page.tsx` thin.
- Follow the **ui-patterns** skill for styling, states, modals and accessibility.
- New UI text is in **English**.

## 5. Navigation
Add a link to `src/components/Sidebar.tsx` with the same classes as the other links.

## 6. Verify
- `pnpm lint` and `pnpm build` must pass.
- Manual checks: CRUD happy path; validation errors; switching habitats; a `curl` without a cookie returns 401; a body with an extra `habitatId` is rejected; mobile widths of 360 and 768px.
- Run the **bff-reviewer** subagent on the diff before you report the task as done.

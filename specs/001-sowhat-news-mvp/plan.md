# Implementation Plan: SoWhat News App — Contextual Utility News Engine

**Branch**: `001-sowhat-news-mvp` | **Date**: 2026-04-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-sowhat-news-mvp/spec.md`

## Summary

SoWhat transforms the day's top 5 headlines into persona-tailored impact cards using a zero-PII "Life Anchors" model (Career, Financial Profile, Housing/Life Stage). A Vite + React frontend (ShadCN UI, Zustand-persist, TanStack Query) collects anchors in `localStorage` and calls a Hono-on-Cloudflare-Workers API that fetches headlines, runs an LLM through the Vercel AI SDK's `generateObject` with a shared Zod schema, and enforces a 3/24h rate limit against hashed anonymous device tokens in Upstash Redis (48h TTL). Per-item partial-success fallback keeps the feed rendered even if some transformations fail.

## Technical Context

**Language/Version**: TypeScript 5.5+ (Node ≥ 20 for tooling; Cloudflare Workers runtime for API)
**Primary Dependencies**:
- Frontend: React 18, Vite 5, ShadCN UI + Tailwind CSS 3, Zustand 4 (with `persist`), TanStack Query 5, Zod 3, `react-router-dom` 6 (single route for MVP but future-proof)
- Backend: Hono 4, `@hono/zod-openapi`, `@hono/swagger-ui` (dev docs), Vercel AI SDK (`ai` v3) with `@ai-sdk/google` (Gemini 1.5 Flash default) and a swappable `@ai-sdk/openai` adapter, Zod 3, `@upstash/redis` + `@upstash/ratelimit`
- Shared: Zod schemas in `packages/shared` consumed by both sides

**Storage**:
- Client: Browser `localStorage` via Zustand `persist` for the 3 anchors + anonymous device token (UUIDv4, generated on first visit)
- Server: Upstash Redis keyed by `ratelimit:<sha256(token)>` with 48h TTL; no application DB, no PII persistence

**Testing**:
- Unit: Vitest (frontend + backend + shared)
- Component: Vitest + `@testing-library/react`
- API contract: Vitest + `hono/testing` driver against Zod-OpenAPI route definitions
- E2E: Playwright (smoke-only for MVP — onboarding, feed render, rate-limit UX)
- Accessibility: `@axe-core/playwright` for WCAG 2.1 AA checks on onboarding, feed, error/rate-limit states

**Target Platform**:
- Frontend: Cloudflare Pages (static SPA build)
- Backend: Cloudflare Workers (Hono edge runtime, Wrangler deploy)

**Project Type**: Web application (SPA + edge API) organised as a pnpm monorepo.

**Performance Goals**:
- p95 end-to-end feed generation < 15 s (SC-003)
- First persona→feed render < 60 s from cold landing (SC-001)
- Return-visit feed regeneration < 10 s (SC-004)
- LCP < 2.5 s on 4G mobile for onboarding view

**Constraints**:
- **Zero PII** end-to-end — no account, no email, no IP persisted
- **WCAG 2.1 AA** for onboarding, feed, and error/rate-limit states
- **Mobile-first** from 320 px; responsive up to 1440 px+
- **Rate limit** 3 requests / 24 h rolling per anonymous device token; stored only as `sha256` with 48 h TTL
- **UTC day boundaries** for the top-stories corpus; feed items refresh at 00:00 UTC
- **Cloudflare Workers constraints**: CPU time ≤ 50 ms/request on free tier (paid tier higher); cold-start friendly; no Node-only APIs — use Web Fetch / WebCrypto

**Scale/Scope**:
- MVP target: ~10k monthly active devices, ≤ 30k feed requests/day (well within rate-limit ceiling × MAU)
- 5 impact cards per feed; 1 onboarding screen, 1 feed screen, error/rate-limit inline states

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: `.specify/memory/constitution.md` is still the unedited template (placeholder principles only). There are therefore **no project-specific ratified gates to evaluate**. Generic Spec Kit defaults apply:

| Gate | Assessment |
|------|------------|
| Simplicity (YAGNI) | ✅ Monorepo with 3 packages (`web`, `api`, `shared`). No DB, no auth, no SSR — only what the spec demands. |
| Test-first discipline | ✅ Plan includes contract tests against `@hono/zod-openapi` routes and Zod schemas before implementation; unit tests colocated. |
| Observability | ✅ Structured logs in the Worker (no PII), Cloudflare Web Analytics on the SPA (no cookies). |
| Integration testing | ✅ Shared Zod schemas are the contract; contract tests cover request validation, rate-limit responses, and partial-success shapes. |
| Zero-PII / privacy | ✅ Hardcoded in the design: `localStorage` only for anchors, hashed device token only on the server with 48 h TTL. |

**Action item**: Ratify `.specify/memory/constitution.md` before first production release so future features have enforceable gates. Tracked as follow-up, not a blocker for this plan.

**Result**: PASS (no unjustified violations; no entries required in Complexity Tracking).

## Project Structure

### Documentation (this feature)

```text
specs/001-sowhat-news-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI + Zod schemas)
│   ├── openapi.yaml
│   └── schemas.ts
├── checklists/          # Existing (from /speckit.specify)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
so-what-news-app/
├── packages/
│   ├── shared/                          # Zod schemas + shared TS types
│   │   ├── src/
│   │   │   ├── schemas/
│   │   │   │   ├── persona.ts           # LifeAnchors schema + option enums
│   │   │   │   ├── impact.ts            # Request/response schemas for /api/generate-impact
│   │   │   │   └── errors.ts            # Standard error envelope
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                             # Vite + React SPA (Cloudflare Pages)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/                  # ShadCN generated components
│   │   │   │   ├── onboarding/
│   │   │   │   │   ├── PersonaForm.tsx
│   │   │   │   │   └── AnchorSelect.tsx
│   │   │   │   ├── feed/
│   │   │   │   │   ├── FeedView.tsx
│   │   │   │   │   ├── ImpactCard.tsx
│   │   │   │   │   ├── ImpactCardSkeleton.tsx
│   │   │   │   │   └── ImpactCardFallback.tsx
│   │   │   │   └── feedback/
│   │   │   │       ├── RateLimitAlert.tsx
│   │   │   │       └── ErrorAlert.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useGenerateImpact.ts # TanStack Query mutation
│   │   │   │   └── useDeviceToken.ts    # UUID bootstrap + persistence
│   │   │   ├── stores/
│   │   │   │   └── personaStore.ts      # Zustand + persist
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts        # typed fetch wrapper
│   │   │   │   └── query-client.ts
│   │   │   ├── pages/
│   │   │   │   └── HomePage.tsx         # Conditional onboarding ↔ feed
│   │   │   ├── styles/
│   │   │   │   └── globals.css
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── components/
│   │   │   └── e2e/                     # Playwright
│   │   ├── public/
│   │   ├── index.html
│   │   ├── tailwind.config.ts
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                             # Hono on Cloudflare Workers
│       ├── src/
│       │   ├── routes/
│       │   │   └── generate-impact.ts   # @hono/zod-openapi route
│       │   ├── services/
│       │   │   ├── news-source.ts       # fetchTopHeadlines (UTC day)
│       │   │   ├── ai-transform.ts      # Vercel AI SDK generateObject
│       │   │   └── rate-limit.ts        # Upstash sliding-window check
│       │   ├── lib/
│       │   │   ├── hash.ts              # WebCrypto sha256 of device token
│       │   │   ├── logger.ts            # PII-safe structured log
│       │   │   └── env.ts               # Zod-validated env bindings
│       │   ├── middleware/
│       │   │   ├── cors.ts
│       │   │   └── error-handler.ts
│       │   └── index.ts                 # Hono app entry, OpenAPI doc mount
│       ├── tests/
│       │   ├── contract/                # hono/testing + OpenAPI round-trip
│       │   ├── unit/
│       │   └── fixtures/
│       ├── wrangler.toml
│       ├── vitest.config.ts
│       └── package.json
│
├── specs/001-sowhat-news-mvp/           # This feature's Spec Kit artifacts
├── docs/                                # idea.md, prd.md (existing)
├── pnpm-workspace.yaml
├── package.json                         # Root scripts: dev, build, test, lint
├── tsconfig.base.json
├── .editorconfig
├── .gitignore
└── README.md
```

**Structure Decision**: **Monorepo (pnpm workspaces) with three packages**: `packages/shared` (Zod schemas are the source of truth), `packages/web` (Vite SPA on Cloudflare Pages), `packages/api` (Hono Worker on Cloudflare). This captures the web-application shape from Technical Context, keeps frontend and backend independently deployable to their respective Cloudflare targets, and makes the shared schemas the contract that satisfies the "end-to-end type safety" requirement from PRD §5.

## Complexity Tracking

*No constitution violations — table intentionally empty.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| — | — | — |

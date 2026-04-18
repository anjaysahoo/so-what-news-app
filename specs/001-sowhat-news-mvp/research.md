# Phase 0: Research & Decisions — SoWhat News App

**Feature**: `001-sowhat-news-mvp`
**Date**: 2026-04-17
**Input**: [plan.md](./plan.md), [spec.md](./spec.md), [../../docs/prd.md](../../docs/prd.md)

All items marked `NEEDS CLARIFICATION` in the plan's Technical Context have been resolved below, plus best-practice and integration patterns for the chosen stack.

---

## 1. Frontend framework — Vite + React vs Next.js App Router

**Decision**: Use **Vite 5 + React 18** as a pure SPA, deployed to **Cloudflare Pages** as static assets.

**Rationale**:
- The backend is an independently deployed Hono worker, so Next.js Route Handlers / Server Actions add overlap we don't need.
- Vite on Cloudflare Pages produces a tiny static bundle with no SSR adapter maintenance (`@cloudflare/next-on-pages` has migration churn).
- All data is rate-limited and user-specific, so SSR caching gives no measurable win.
- Keeps the frontend deploy a trivial static upload; backend deploy is Wrangler. Two independent surfaces, zero coupling.

**Alternatives considered**:
- **Next.js App Router on Cloudflare Pages** — rejected: extra adapter layer, opinionated routing overkill for a single-screen MVP, and duplicates Hono's edge role.
- **Remix on Cloudflare** — rejected: great fit technically, but project requires ShadCN/Zustand/TanStack patterns that the team already has in Vite, and Remix loaders would compete with TanStack Query.

---

## 2. Backend runtime — Hono on Cloudflare Workers

**Decision**: **Hono 4** with `@hono/zod-openapi` deployed to **Cloudflare Workers** via Wrangler.

**Rationale**:
- Hono is designed for edge runtimes (no Node builtins), ships OpenAPI + Zod integration as a first-class package, and has a tested middleware ecosystem for CORS and error handling.
- `@hono/zod-openapi` gives us a single source of truth: define a Zod schema, get runtime validation, typed handlers, and a generated OpenAPI 3.0 document — directly satisfies PRD §5 end-to-end type safety.
- Cloudflare Workers give globally low-latency execution near the LLM provider's nearest region, improving p95 on SC-003.

**Alternatives considered**:
- **Cloudflare Pages Functions (file-based routes)** — rejected: less expressive than Hono, no OpenAPI generator out of the box.
- **Deno Deploy / Vercel Edge** — rejected: PRD explicitly targets Cloudflare; staying on one platform simplifies env management.

---

## 3. LLM provider and structured output

**Decision**: Primary model **Google Gemini 1.5 Flash** via `@ai-sdk/google`, fallback adapter for **OpenAI GPT-4o-mini** via `@ai-sdk/openai`, both invoked through `generateObject` from the Vercel AI SDK (`ai` v3) with the shared `impactSchema` Zod schema.

**Rationale**:
- Gemini 1.5 Flash is cheapest per 1M tokens in the "good enough" tier for structured personalization and has a free quota useful for development.
- `generateObject` + Zod forces valid JSON — eliminates the main LLM failure mode (malformed output) that would break the feed.
- Provider selection is one env var (`AI_PROVIDER`) + conditional import — keeps us swappable if latency or cost changes.

**Configuration defaults**:
- `temperature`: 0.4 (enough variation, low drift)
- `maxOutputTokens`: 900 (5 items × ~140 tokens + overhead)
- Per-request timeout: 12 s (budget fits within 15 s SC-003 with 3 s network + news fetch)
- Retries: 1 retry on 5xx or timeout, then fall back to per-item `{ personalized: false, fallbackReason }` for any stories still missing

**Alternatives considered**:
- **Prompt-only JSON without AI SDK** — rejected: malformed JSON is the #1 production LLM failure; Zod-enforced output is non-negotiable.
- **Claude Haiku** — kept as a future option; not included in MVP to limit provider surface area.

---

## 4. News source

**Decision**: Use **NewsAPI.org `/v2/top-headlines?language=en&pageSize=10`** as the canonical source, requesting 10 and trimming to 5 valid items after filtering.

**Rationale**:
- Meets the PRD's "top 5 daily headlines" requirement, supports `language=en` (spec Assumption: English-only MVP), returns `publishedAt` for UTC-day filtering.
- Over-fetching 10 and trimming to 5 covers the "fewer than 5 valid" edge case without a second request.
- Simple REST, no SDK needed — works cleanly with Worker `fetch`.

**UTC day boundary implementation**:
- Compute `todayUtc = new Date().toISOString().slice(0, 10)` at request time.
- After fetch, discard items whose `publishedAt` UTC date is not today; if fewer than 5 remain, top up with yesterday's items (still sorted by `publishedAt` desc) to guarantee 5 when possible.
- Corpus refresh at 00:00 UTC is a natural consequence of this filter.

**Alternatives considered**:
- **Guardian Open Platform** — rejected: narrower topic mix for a general-utility feed.
- **GDELT** — rejected: overkill raw volume; would need our own ranking layer.

---

## 5. Rate limiting — hashed device tokens in Upstash Redis

**Decision**: **Sliding-window rate limit** of **3 requests / 24 h** keyed on `sha256(deviceToken)`, implemented with **`@upstash/ratelimit`** over the **`@upstash/redis`** REST client. Redis keys carry a **48 h TTL** (matches spec FR-007 and clarifications).

**Rationale**:
- `@upstash/ratelimit`'s `slidingWindow(3, "24 h")` exactly matches FR-007.
- REST client works natively on Cloudflare Workers (no TCP dependency).
- Hashing the token server-side with WebCrypto (SHA-256) means we never persist the raw token — the client holds the only copy. This satisfies the clarification "hashed anonymous device tokens with automatic expiry after 48 hours."
- 48 h TTL covers the full 24 h window plus slack for clock drift and late-arriving records.

**Device token lifecycle**:
1. On first visit the web client generates `crypto.randomUUID()` and stores it in `localStorage` under `sowhat.deviceToken` (not in Zustand `persona` store — kept in a separate key so clearing persona doesn't re-trigger rate limiting).
2. Every API request sends it in the `X-Device-Token` header.
3. Worker computes `sha256` (WebCrypto `crypto.subtle.digest`), feeds to `@upstash/ratelimit`.
4. Redis entries expire automatically after 48 h.

**429 response shape** (see contracts):
```json
{
  "error": "rate_limited",
  "message": "You've reached your daily limit. Try again in ~17 hours.",
  "retryAfterSeconds": 61200
}
```
`retryAfterSeconds` is derived from `@upstash/ratelimit`'s `reset` timestamp, also mirrored into the HTTP `Retry-After` header.

**Alternatives considered**:
- **IP-based rate limiting with `cf-connecting-ip`** — rejected: spec clarification chose device-token over IP for privacy and better NAT behaviour.
- **Cloudflare's built-in Rate Limiting Rules** — rejected: IP-based; same privacy issue, plus less flexible response body.
- **Durable Objects counter** — rejected: more moving parts than needed for 3/24 h with a 48 h window.

---

## 6. Accessibility (WCAG 2.1 AA) toolchain

**Decision**: Combine **`@axe-core/playwright`** in E2E, **`eslint-plugin-jsx-a11y`** at lint time, and manual keyboard/VO passes on the three flows (onboarding, feed, error/rate-limit).

**Rationale**:
- ShadCN UI components are Radix-based → correct ARIA roles out of the box.
- Axe covers automated checks; `jsx-a11y` catches structural mistakes during development.
- SC-008 explicitly requires WCAG 2.1 AA; automated + manual mix is the industry standard for meeting that bar.

**Specific gates**:
- Every interactive element has a visible focus ring (Tailwind `focus-visible:ring-2`).
- All form controls have associated `<label>` or `aria-label`.
- Error/rate-limit alerts use `role="alert"` and `aria-live="polite"` so screen readers announce state changes.
- Color contrast ≥ 4.5:1 enforced via ShadCN token choices — verified per release.

---

## 7. State management split

**Decision**:
- **Persona (3 anchors)** → Zustand store with `persist` middleware keyed on `sowhat.persona` in `localStorage`.
- **Device token** → separate `localStorage` key `sowhat.deviceToken`, managed by a plain hook (not Zustand) so it is independent of persona resets.
- **Server data (impact feed, loading, errors)** → **TanStack Query** mutation (not a cached query — each "Generate" click is a fresh POST). We keep `onSuccess` data in mutation state and render from there; re-requesting re-runs the mutation.

**Rationale**:
- Zustand `persist` is battle-tested for small key-value UI state — exactly what PRD §3.2 calls out.
- Using a mutation (not `useQuery`) reflects the action-oriented semantics of "Generate My Daily Impact" and sidesteps cache-key collisions.
- Clean separation between client-owned state (persona, token) and server-owned state (feed) makes testing and the zero-PII story trivially verifiable.

---

## 8. Testing strategy

**Decision**:
- **Shared package**: Vitest unit tests over Zod schemas (parse/reject fixtures).
- **API package**:
  - Unit tests for `hash`, `rate-limit`, `news-source` (with `fetch` mocked), `ai-transform` (with `generateObject` mocked).
  - Contract tests using `hono/testing` that send fixture requests against the real Zod-OpenAPI routes and assert the 200/400/429/502 response shapes exactly match `packages/shared` schemas.
- **Web package**:
  - Component tests (Testing Library) for `PersonaForm`, `FeedView` (covering skeleton, loaded, partial-success, error, rate-limit states).
  - Hook tests for `useGenerateImpact` with MSW mocking the API.
  - Playwright smoke E2E: onboarding → generate → verify 5 cards render; trigger 429 path via MSW/mocked API; Axe check on each of the three WCAG target screens.
- Coverage targets: 80% lines for `shared` and `api`; "critical path green" for `web` (not chasing % for UI).

**Rationale**: Tests sit closest to the contract (shared Zod schemas), so the most valuable coverage is on the boundary, not on every UI branch.

---

## 9. Error taxonomy and user-facing copy

**Decision**: Single backend error envelope with a discriminated union of `error` codes:

| `error` | HTTP | Cause | UI surface |
|---|---|---|---|
| `validation_failed` | 400 | Zod request parse error | Inline under form (shouldn't happen in practice — frontend validates) |
| `rate_limited` | 429 | 3/24h exceeded | `RateLimitAlert` with friendly countdown |
| `news_unavailable` | 502 | NewsAPI 5xx or empty result | `ErrorAlert` "We can't reach today's news. Try again shortly." |
| `ai_unavailable` | 502 | LLM provider 5xx or schema-coercion failure after retries | `ErrorAlert` "Personalization is taking a break. Try again shortly." |
| `internal_error` | 500 | Uncaught exception | Generic `ErrorAlert`; Worker logs structured `requestId` |

**Partial success**: `200 OK` with `newsItems[].personalized: false` for individual failed transformations (so the feed still renders — matches spec clarification on partial success).

**Rationale**: Keeps frontend mapping simple (switch on `error` code), keeps messages user-friendly, and uses HTTP codes correctly for caching/retry hints.

---

## 10. Environment and secrets

**Decision**: All secrets live in **Cloudflare Worker bindings** (not source code, not `.env` committed). Local development uses `wrangler.toml` `[vars]` and `[secrets]` with `wrangler dev --local`. Web build reads only the public API base URL from `VITE_API_BASE_URL`.

| Env var | Scope | Purpose |
|---|---|---|
| `NEWS_API_KEY` | Worker secret | NewsAPI.org auth |
| `AI_PROVIDER` | Worker var | `"google"` \| `"openai"` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Worker secret | Gemini access (required when `AI_PROVIDER=google`) |
| `OPENAI_API_KEY` | Worker secret | OpenAI access (required when `AI_PROVIDER=openai`) |
| `UPSTASH_REDIS_REST_URL` | Worker var | Upstash endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Worker secret | Upstash auth |
| `ALLOWED_ORIGIN` | Worker var | CORS allow-list (e.g. `https://sowhat.pages.dev`) |
| `VITE_API_BASE_URL` | Pages build var | e.g. `https://sowhat-api.example.workers.dev` |

A Zod schema in `api/src/lib/env.ts` parses and validates these at cold start — missing/invalid values fail the Worker fast with a clear log, satisfying org-wide rule "do not hardcode secrets" and "validate environment variables."

---

## 11. CORS policy

**Decision**: The Worker sets `Access-Control-Allow-Origin` to the single value of `ALLOWED_ORIGIN` (no wildcard), allows methods `POST, OPTIONS`, and the headers `Content-Type, X-Device-Token`. No credentials are sent.

**Rationale**: Satisfies org rule "Configure CORS with explicit allow-lists for origins, methods, and headers; avoid permissive `*` configurations."

---

## 12. Logging & observability

**Decision**: A lightweight structured JSON logger in the Worker emits `{ level, msg, requestId, route, durationMs }` per request. The persona and device token are **never logged** — only their hash prefix (first 8 hex chars) for debugging. Cloudflare Workers Logs captures these; no external SIEM for MVP.

**Rationale**: Satisfies both "security-relevant logging with sufficient context" and "do not log sensitive data" from the org-wide Master rules.

---

## Summary of decisions

| Area | Decision |
|---|---|
| Frontend | Vite 5 + React 18 SPA on Cloudflare Pages |
| Backend | Hono 4 + `@hono/zod-openapi` on Cloudflare Workers |
| LLM | Gemini 1.5 Flash (primary) via Vercel AI SDK `generateObject` |
| News source | NewsAPI.org `/v2/top-headlines?language=en&pageSize=10` |
| Rate limiting | `@upstash/ratelimit` sliding window 3/24h, sha256 of device token, 48h TTL |
| Accessibility | Radix/ShadCN + Axe + jsx-a11y, WCAG 2.1 AA |
| Client state | Zustand `persist` (persona), plain hook (device token), TanStack Query mutation (feed) |
| Testing | Vitest + `hono/testing` + Testing Library + Playwright + `@axe-core/playwright` |
| Error model | Discriminated-union error envelope + 200 partial success |
| Secrets | Cloudflare Worker bindings, Zod-validated at cold start |
| CORS | Explicit allow-list via `ALLOWED_ORIGIN` |
| Logging | Structured JSON, zero-PII, hash prefix only |

All NEEDS CLARIFICATION items resolved.

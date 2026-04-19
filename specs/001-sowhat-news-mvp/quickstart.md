# Quickstart — SoWhat News App

**Feature**: `001-sowhat-news-mvp`
**Audience**: New contributor wanting to run the app end-to-end locally in < 15 minutes.

---

## Prerequisites

| Tool | Version | Why |
|---|---|---|
| Node.js | ≥ 20.11 | Vite 5, Wrangler 3, Vitest |
| pnpm | ≥ 9 | Monorepo workspaces |
| Wrangler | ≥ 3.80 | `pnpm add -g wrangler` or use `pnpm dlx wrangler` |
| A NewsAPI.org API key | free tier | News headlines |
| A Google AI Studio API key | free tier | Gemini 1.5 Flash (default LLM) |
| An Upstash Redis REST endpoint + token | free tier | Rate-limit storage |

---

## 1. Clone & install

```bash
git clone <this-repo>
cd so-what-news-app
git checkout 001-sowhat-news-mvp
pnpm install
```

---

## 2. Configure environment

### API (`packages/api/.dev.vars`)

Create `packages/api/.dev.vars` — **this file is gitignored** and is read by `wrangler dev`:

```dotenv
NEWS_API_KEY=pk_your_newsapi_key
AI_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
ALLOWED_ORIGIN=http://localhost:5173
```

### Web (`packages/web/.env.local`)

```dotenv
VITE_API_BASE_URL=http://localhost:8787
```

> Never commit any `.env*` or `.dev.vars` file. Both paths are in `.gitignore`.

---

## 3. Run both services

In two terminals (or one with `pnpm dev` orchestrating both via `turbo`/`concurrently`):

```bash
# Terminal 1: Hono API on Cloudflare Workers (local)
pnpm --filter @sowhat/api dev
# Serves http://localhost:8787
# Swagger UI at   http://localhost:8787/docs
# OpenAPI JSON at http://localhost:8787/openapi.json

# Terminal 2: Vite SPA
pnpm --filter @sowhat/web dev
# Serves http://localhost:5173
```

Open `http://localhost:5173` and you should see the onboarding page.

---

## 4. Smoke-test the happy path

1. Pick one option from each of **Career / Industry**, **Financial Profile**, **Housing / Life Stage**.
2. Click **Generate My Daily Impact**.
3. Expect:
   - ShadCN skeleton cards for ≤ 15 seconds.
   - Five impact cards, each with: "Why this matters to you" badge, personalized headline (or a muted fallback note + original headline), impact summary, and a source-link footer.
4. Hit **Regenerate** twice more. On the **4th** click within 24 hours you should see the `RateLimitAlert` with a friendly retry-after message.

---

## 5. Verify privacy guarantees

From DevTools Console on `http://localhost:5173`:

```js
Object.keys(localStorage);
// → includes: "sowhat.persona", "sowhat.deviceToken"
JSON.parse(localStorage["sowhat.persona"]);
// → { state: { careerIndustry: "…", financialProfile: "…", housingLifeStage: "…" }, version: 0 }
localStorage["sowhat.deviceToken"];
// → a UUID v4
```

There should be **no** `email`, `name`, `ip`, or other PII keys anywhere.

In the Worker logs (`wrangler dev` output), confirm:
- No log line contains the full device token — only the first 8 hex chars of its SHA-256 hash.
- No log line contains persona human labels — only the enum codes.

---

## 6. Run tests

```bash
# All packages
pnpm test

# Just the shared Zod schemas
pnpm --filter @sowhat/shared test

# API contract + unit tests (hono/testing)
pnpm --filter @sowhat/api test

# Web component tests
pnpm --filter @sowhat/web test

# E2E (Playwright) — requires both dev servers running
pnpm --filter @sowhat/web test:e2e
```

Coverage thresholds are enforced in `vitest.config.ts` per package.

---

## 7. Accessibility check

```bash
pnpm --filter @sowhat/web test:e2e -- a11y
```

Runs `@axe-core/playwright` against the three WCAG target screens (onboarding, feed, rate-limit). The run fails the build on any violation of level **serious** or above on a WCAG 2.1 AA rule.

---

## 8. Story-by-story acceptance walkthrough

Follow the Acceptance Scenarios in `spec.md` and verify each:

| Spec section | What to do | Expected |
|---|---|---|
| US1.1 | Open fresh incognito → land on onboarding | Three empty selects visible |
| US1.2 | Click Generate with < 3 anchors set | Button disabled / inline hint |
| US1.3 | Complete persona → close tab → reopen | Selections restored, no re-onboarding |
| US1.4 | Change any anchor → regenerate | New feed reflects updated persona |
| US2.1 | Generate feed | 5 cards with required fields |
| US2.2 | Slow network (DevTools) | Skeleton visible during load |
| US2.3 | Two different personas in two browsers | Same originals, different impact text (for personalized items) |
| US2.4 | Click source link | Opens original in new tab |
| US3.1 | 4th request in 24h | `RateLimitAlert` with retry-after |
| US3.2 | Stop the LLM (unset `GOOGLE_GENERATIVE_AI_API_KEY`) → request feed | Friendly `ai_unavailable` alert |
| US3.3 | Break the NewsAPI key → request feed | Friendly `news_unavailable` alert |
| US4.1–4 | Resize to 320 / 768 / 1440 px, keyboard-only navigate | Layout + focus + contrast all pass |

---

## 9. Deployment (reference, not part of MVP quickstart)

```bash
# API
pnpm --filter @sowhat/api deploy
# → wrangler deploy, secrets pushed via `wrangler secret put`

# Web
pnpm --filter @sowhat/web build
# Upload dist/ to Cloudflare Pages
# (In practice: connect the repo in Cloudflare Pages dashboard and set VITE_API_BASE_URL)
```

Set `ALLOWED_ORIGIN` in the deployed Worker to the final Pages URL (e.g., `https://sowhat.pages.dev`).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `CORS error` in browser | `ALLOWED_ORIGIN` in `.dev.vars` doesn't match Vite port | Set it to `http://localhost:5173` exactly |
| All cards show fallback text | LLM auth fails; check Worker log for `ai_unavailable` | Re-check `GOOGLE_GENERATIVE_AI_API_KEY` |
| Instant 429 on first request | Stale rate-limit entry from a previous key | Expire the Redis key: `ratelimit:*` or wait 48h |
| Persona doesn't persist | Browser in private mode with storage disabled | Use a normal window — spec acknowledges this as a known limitation |
| `impactHeadline must be 10–15 words` warning in logs | LLM occasionally drifts | Expected; that item is coerced to fallback — no user-facing breakage |

# SoWhat News — Buildathon Scope

**Stack:** Next.js (App Router) + Vercel. Nothing else.
**Duration:** 4 hours.
**Magic moment:** Side-by-side — generic headline vs. persona-personalized impact headline.

---

## PROJECT
SoWhat News — a Contextual Utility News Engine that rewrites headlines through an anonymous persona so readers see how news affects *them*, not just what happened.

## ITERATION 0 (20 min)
`node core.js` — reads a hardcoded persona + 5 hardcoded headlines, calls the LLM via Vercel AI SDK `generateObject` with a Zod schema, prints generic→impact pairs to the terminal. Proves the collision works before any UI exists.

## ITERATION 1 (1 hr)
Next.js app with three ShadCN `<Select>` dropdowns (Career, Financial Profile, Life Stage) + a "Generate" button. Next.js API route `/api/generate-impact` wraps the Iteration 0 logic. Renders 5 side-by-side cards (generic left, impact right). No styling polish yet — just working end-to-end.

## ITERATION 2 (1 hr)
Polish the demo surface — ShadCN skeleton loaders during LLM call, "Why this matters to you" badges, readable typography, generic headline de-emphasized (gray/strikethrough) so the impact headline pops. **Deploy to Vercel and test on the live URL.**

## ITERATION 3 (1 hr — stretch, pick ONE)
- (a) Preset persona buttons ("IT engineer in Bengaluru", "Retired homeowner in Mumbai") for snappier demo switching, OR
- (b) Reveal animation so impact headlines fade in one-by-one.

Not both.

## DEMO MOMENT
Judge sees three dropdowns → picks "Tech / Investor / Renter" → clicks Generate → skeletons → 5 cards animate in showing the *same* 5 headlines rewritten through that persona's lens. Then judge changes one dropdown to "Retired / Homeowner / Parent" → same headlines, totally different impact stories. That's the "oh."

## NOT BUILDING
- News API integration
- Upstash Redis rate limiting
- Zustand + localStorage persistence (use `useState`)
- OpenAPI spec + generated types (just share a Zod schema file across client/server)
- Hono.js / Cloudflare Workers (Next.js API routes only)
- Auth, database, error alert components

## FAKING
- 5 headlines hardcoded in `constants/headlines.ts` — pick real, juicy ones (Budget 2026 stories from `docs/idea.md` are gold)
- No rate limiting — judges won't DDoS the demo
- No persistence — refresh resets state, fine for demo
- No `cf-connecting-ip` logic — doesn't exist on Vercel, skip it

---

## RISKS

### 1. LLM latency
A single `generateObject` call returning all 5 items can take 10–15 seconds — demo-killing.

**Mitigation:** Fire **5 parallel `generateObject` calls** (one per headline), each returning a single object. `Promise.all` them in the API route. Usually 3–5s total.

### 2. Stack drift from PRD
The PRD specs Hono on Cloudflare Workers with `cf-connecting-ip`, Upstash Redis, and OpenAPI codegen. None of that applies here.

**Mitigation:** Use Next.js App Router API routes (`app/api/generate-impact/route.ts`). Drop Hono, drop Upstash, drop OpenAPI. Share one Zod schema file between the route handler and the client. Saves roughly an hour of setup time.

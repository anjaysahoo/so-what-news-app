# SoWhat News — Scope 2: On-Demand Personalization + Relevance Scoring

**Stack:** Next.js (App Router) + Vercel. Same as v1, nothing new.
**Duration:** 4 hours.
**Builds on:** scope.md (hardcoded headlines, persona selection, batch side-by-side cards — all working and deployed).
**Magic moment:** A card feed where you tap "So What?" on any headline and watch it transform — some headlines score 9/10 and glow, others score 2/10 and fade. The app stops rewriting everything equally and starts telling you what actually matters.

---

## PROJECT
SoWhat News v2 — shift from batch "generate all" to on-demand per-headline personalization with relevance scoring. Same hardcoded headlines, fundamentally different interaction. The app earns its name: it literally answers "so what?" per headline.

## ITERATION 0 (20 min)
`node core-v2.js` — takes a hardcoded persona + 1 hardcoded headline, calls `generateObject` with the updated Zod schema (now includes `relevanceScore: 1–10`), prints `{ impactHeadline, whyItMatters, relevanceScore }` to terminal. Proves: relevance scoring works and the LLM returns meaningful variance (not every headline is a 7).

Test with 3 headlines sequentially — one that should score high for the persona, one medium, one irrelevant. Verify the scores make sense before touching UI.

## ITERATION 1 (1.5 hr)
- **New API route** `POST /api/personalize` — accepts `{ headline: string, persona: Persona }`, returns a single `{ impactHeadline, whyItMatters, relevanceScore }`. Keep the old `/api/generate-impact` batch route alive (don't break v1).
- **Redesign home page** from side-by-side grid to a **single-column card feed**. Each card shows the raw headline in a clean card — no personalization yet, just the headline text.
- Each card has a **"So What?" button**.
- Tapping it: button → per-card skeleton loader → card expands to reveal `impactHeadline`, `whyItMatters`, and a **relevance badge** (number + color).
- Persona selection (3 dropdowns + presets) stays at top of page, unchanged.
- Expand the hardcoded headline set from 5 → **10–12** headlines to make the feed feel like a real feed. Pick diverse topics so relevance scores vary across personas.

## ITERATION 2 (1.5 hr)
- **Relevance badge color scale:** green (8–10), amber (5–7), red (1–4). Badge sits on the card as a pill.
- **Low-relevance dimming:** personalized cards scoring ≤ 3 get reduced opacity + slight scale-down. Visual signal: "this doesn't matter to you."
- **"Sort by relevance" toggle** — appears after 3+ cards are personalized. Reorders personalized cards by score (high → low), un-tapped cards stay at the bottom in original order.
- **Smooth expand animation** on "So What?" tap — card height transition, impact content fades in.
- **localStorage for persona:** persist the 3 dropdown selections so they survive page refresh. One `useLocalStorage` hook, no Zustand. On load, read from localStorage or fall back to defaults.
- General UI polish: typography, spacing, responsive layout (desktop-first but don't break mobile).

## ITERATION 3 (1 hr — stretch, pick ONE)
- (a) **"Personalize All"** button — fires parallel LLM calls for all un-tapped headlines, results animate in one by one as they resolve. For when the judge wants the full picture fast. OR
- (b) **Persona switch re-personalization** — when the user changes persona after some cards are already personalized, show a prompt: "Re-personalize X headlines for new persona?" Tapping yes re-runs those cards. Shows the same headline scoring differently for different people.

Not both.

## DEMO MOMENT
Judge opens the app → sees 10+ headlines in a clean feed. Picks "Tech / Investor / Renter" preset. Taps "So What?" on a headline about semiconductor tariffs → card expands: "Your chip stocks are directly exposed. Relevance: 9/10" (green badge). Taps a headline about agricultural subsidies → "No impact on your portfolio or rent. Relevance: 2/10" (red badge, card fades). Taps "Sort by relevance" → feed reorders, noise sinks. Then switches persona to "Teacher / Saver / Parent" → taps the same semiconductor headline → "Relevance: 3/10." Same news, different person, different score. That's the "oh."

## NOT BUILDING
- News API integration (headlines stay hardcoded)
- In-app article reader
- Images on cards (no source for them without a news API)
- Category / topic filtering
- Caching layer
- Rate limiting
- Multi-step onboarding wizard
- Auth, database, user accounts
- Persona comparison side-by-side view

## FAKING
- Headlines are hardcoded in `constants/headlines.ts` — expand to 10–12, pick diverse real-world topics
- No rate limiting — judges won't spam it
- "Sort by relevance" only reorders personalized cards; un-tapped ones stay put
- No persistence of LLM results — refresh clears personalized cards (only persona persists via localStorage)

---

## RISKS

### 1. On-demand LLM calls on every tap
Each "So What?" tap fires a separate OpenAI call (~1–3s each). If judge rapid-taps 5 cards, that's 5 concurrent calls.

**Mitigation:** Per-card loading state — show skeleton on the tapped card, disable its button. Other cards remain tappable. `Promise` per card, no global queue needed.

### 2. Relevance scores clustering around 5–7
LLMs love being lukewarm. If every headline scores 5–7, the sorting/dimming features are useless.

**Mitigation:** Prompt engineering — explicitly instruct: "Be harsh. Most headlines should score 2–4 for any given persona. Only score 8+ if the news directly and materially impacts this specific person's finances, career, or daily life. A score of 10 means they need to act on this today." Test in Iteration 0 and tune before building UI.

### 3. UI architecture shift (batch → on-demand)
The current page.tsx is built around a single "Generate" button that returns all results at once. Switching to per-card state is a meaningful refactor.

**Mitigation:** Don't mutate the existing page. Build the new feed as a fresh component (`components/NewsFeed.tsx` + `components/NewsCard.tsx`). Replace the page content once the new components work. Keep old code around until the new flow is solid.

### 4. Card expand/collapse jank
Animating height changes in React is notoriously janky without a library.

**Mitigation:** Use CSS `grid-template-rows: 0fr → 1fr` transition trick (works in all modern browsers, no JS animation library needed). Or just use `max-height` transition with a generous max. Don't reach for Framer Motion — it's a dep you don't need for this.

---

## KEY SCHEMA CHANGE

Add `relevanceScore` to the existing `ImpactCard` Zod schema:

```
relevanceScore: z.number().int().min(1).max(10)
  .describe("How relevant this headline is to the persona. 1 = no impact on their life. 10 = they need to act on this today. Be harsh — most news is a 2–4 for any given persona.")
```

## KEY PROMPT CHANGE

Update the system prompt to include:
"Rate relevance 1–10 based on how directly this news impacts someone with this persona. Be brutal — a 5 means 'mildly interesting,' a 3 means 'skip it,' and only a 9–10 means 'this changes your week.' Most headlines should land between 2–5 for any given persona."

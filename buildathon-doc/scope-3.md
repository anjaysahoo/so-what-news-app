# SoWhat News — Scope 3: Brand + Portrait Cards + The Flip

**Stack:** Next.js (App Router) + Vercel. Same as v1/v2.
**Duration:** 4 hours.
**Builds on:** scope-2.md (on-demand personalization + relevance scoring — assumed working).
**Magic moment:** A cream-colored feed of beautiful portrait cards — image + bold headline. Tap the yellow "So What?" button. The card does a crisp 3D flip, revealing a black-and-yellow back with your personalized summary and a big relevance score. The flip IS the product.

---

## PROJECT
SoWhat News v3 — the **brand iteration**. Same personalization engine from v2, but the UI finally looks like the logo. Portrait cards with images, pre-fetched personalization, and a 3D card flip that turns the "So What?" tap into a brand moment. This is the version you'd screenshot.

## ITERATION 0 (20 min) — Prove the flip is not jank
**NOT a terminal command this time** — the terminal stuff is already proven from v2. The new unknown is the flip animation.

Open a single static HTML file: two-sided div, `transform-style: preserve-3d`, `perspective: 1000px` on parent, click toggles `rotateY(180deg)`. Front and back both visible + readable, no glitches on mobile Safari or Chrome. If this feels crisp in 20 min, the whole scope unlocks. If it feels janky, **stop and reconsider** — don't reach for Framer Motion, that's a 1-hour rabbit hole.

Deliverable: a single `flip-test.html` file in the repo that you trash after. Timeboxed hard.

## ITERATION 1 (1 hr) — Portrait cards + brand + images, no flip yet
- **Drop the images in repo:** `public/news/01.jpg` ... `public/news/12.jpg`. One per hardcoded headline. Portrait aspect (recommend 3:4 or 2:3). Use `next/image` with local imports for free optimization.
- **Update `constants/headlines.ts`:** add `image: string` field per headline (`/news/01.jpg`).
- **Rewrite `NewsFeed.tsx` layout:** single vertical column of portrait cards. ~400px wide on desktop, full-width on mobile. Gap between cards. Page background cream (`#FAF7F0` or similar — test against logo).
- **Card front:** image fills top 60%, headline (serif, bold, ~24px) bottom 40%, yellow "So What?" button anchored bottom. Subtle shadow, rounded corners. White card on cream page.
- **Brand chrome:** header bar with the logo (drop the PNG in as-is for now — don't try to recreate the script type). Pick fonts: **Playfair Display** for headlines, **Inter** for body. Both via `next/font/google`.
- **No flip, no personalization yet.** Just make the feed look expensive. If you can't show it to someone and have them say "that's pretty," the rest doesn't matter.

## ITERATION 2 (1.5 hr) — Pre-fetch + the flip
- **Pre-fetch on persona change:** when persona is set/changed, fire `Promise.allSettled` across all 12 headlines hitting `/api/personalize`. Show a shimmer/skeleton overlay on the "So What?" button per card until its result lands (button is disabled + spinning, rest of card is interactive).
- **Cache by persona signature** in a `useRef<Map<string, Result[]>>` so toggling between two personas is instant on the second visit. Keyed by `JSON.stringify(persona)`.
- **Card back design:** black background (`#111` or pure black), yellow accents. Layout:
  - Big relevance score top-right (`9/10` in yellow, ~48px).
  - `impactHeadline` as the main text (serif, white, ~22px).
  - `whyItMatters` as body (sans, off-white, ~15px).
  - Small "← back" hint bottom-left.
- **The flip:** CSS 3D, `rotateY(180deg)`, ~500–600ms ease-out. `perspective` on the card container. Tap "So What?" on front → flip. Tap anywhere on back → flip back. Per-card local state (`useState<boolean>`), no global store.
- **Button state machine:** `idle` (yellow, "So What?") → `loading` (yellow with spinner, disabled) → `ready` (yellow, pulsing subtly to invite the tap) → after tap, card flips.

## ITERATION 3 (1 hr — pick ONE, do not do both)
- (a) **Bring back relevance dimming from scope-2:** after flip-back (or automatically after pre-fetch), cards scoring ≤ 3 get dimmed/desaturated on the FRONT. Signal: "this already flipped, and it wasn't worth it." Cheap to add, strong signal. OR
- (b) **"Flip all" cascade** — a button that flips every card in sequence with a 100ms stagger. Theatrical, great for the demo finale. Visually impressive but adds no real product value.

**Recommendation: (a).** It re-uses scope-2's signal, which is the actual thesis of the app. (b) is a party trick.

## DEMO MOMENT
Judge opens the app → cream background, yellow `SoWhat?` logo top-left, a clean vertical feed of portrait cards with real imagery. Picks "Tech / Investor / Renter." Cards shimmer briefly as pre-fetch runs (~2s). Scrolls to "Semiconductor tariffs rattle supply chain." Taps the yellow **So What?** button. The card does a buttery 3D flip — back is black with bold yellow accents. `9/10` in big yellow type. "Your chip holdings are directly exposed. Expect volatility this week." Judge says "oh." Taps another — agricultural subsidy news — flips to show a muted `2/10`, and the card's front-side dims when flipped back. Every flip is the product.

## NOT BUILDING
- News API (headlines + images still hardcoded)
- Sort-by-relevance toggle (freeze scope-2's version, too noisy with the flip)
- Persona switch re-personalization prompt (just silently re-fetch via the cache)
- Onboarding, auth, DB (same as v1/v2)
- AI-generated images (killer scope creep — use curated stock)
- Framer Motion or any animation library (pure CSS 3D transforms)
- Flip sound / haptics (tempting, skip it)
- Mobile swipe gestures beyond native scroll
- Custom logo recreation in CSS (ship the PNG, move on)

## FAKING
- 10–12 portrait images curated manually and committed to `public/news/`
- Pre-fetch re-runs from scratch on first visit to each persona; in-memory cache only (refresh nukes it)
- Flip state is per-card local — no persistence
- `whyItMatters` text length is not controlled — if the LLM returns 3 paragraphs, the back of the card scrolls internally (`overflow-y: auto`); don't rewrite the prompt to constrain it

---

## RISKS

### 1. The flip looks janky on mobile
3D transforms in React + some Tailwind combos cause flicker on iOS Safari (backface-visibility issues, subpixel rendering).

**Mitigation:** iteration 0 is literally "prove this works" in a static file. Hard-code `backface-visibility: hidden` on both faces, `transform-style: preserve-3d` on the flipper, `perspective: 1000px` on the parent. Don't nest the flipper inside anything with its own `transform` — it destroys the 3D context.

### 2. Pre-fetch cost on persona change
12 parallel LLM calls every persona change. At ~1–3s per call and running in parallel that's ~3s wall time, but it's 12× the API cost per toggle. On demo day with judges toggling: fine. In production: bad.

**Mitigation:** `useRef` Map cache keyed by persona signature. Add a cheap debounce (400ms) on persona dropdown changes so rapid toggling doesn't fire 3 batches. Also — `Promise.allSettled`, not `all` — one failed call shouldn't nuke the whole feed.

### 3. Image weight
12 portrait images × ~300KB each = ~3.6MB. Acceptable on desktop, meh on mobile.

**Mitigation:** `next/image` with local imports does the heavy lifting (auto-WebP, responsive sizes, lazy loading). Run images through a compressor before committing — target <150KB each. Commit originals to `assets/`, optimized versions to `public/news/`.

### 4. Brand guesswork
The logo's yellow is warm and specific. Eyeballing hex from a PNG will be off.

**Mitigation:** sample the logo PNG with a color picker once, pin the hex in a `theme.ts` or CSS variable (`--brand-yellow: #F5D547`), and use that everywhere. Don't eyeball it per-component.

### 5. Portrait cards break on short viewports
A 3:4 card that's 400px wide is 530px tall. On a 768px-tall laptop with browser chrome, only ~1.3 cards are visible. Demo scrolling looks cramped.

**Mitigation:** make cards responsive-height: `aspect-ratio: 3/4` with a `max-height: 75vh`. Image takes 55%, content 45%. Judge sees 1 card fully + the top of the next, which actually helps the "feed" feel.

### 6. Contradiction with scope-2's thesis
v2 was "on-demand per-tap personalization." v3 pre-fetches everything on load, which kills that purity.

**Reality check:** you're demoing, not shipping. Pre-fetch wins for UX. You can still frame it in the demo as "we pre-personalize in the background so the flip feels instant." Nobody cares if you call the endpoint per-card or in a batch — they care that the flip is snappy.

---

## BRAND TOKENS (pin these before writing CSS)

```
--brand-yellow: #F5D547   // sample from the logo PNG and replace
--brand-black:  #111111
--page-bg:      #FAF7F0   // warm cream
--card-bg:      #FFFFFF
--card-back-bg: #111111
--text-primary: #1A1A1A
--text-muted:   #6B6B6B
--text-on-dark: #FAF7F0

font-display: "Playfair Display", serif   // headlines, logo fallback
font-body:    "Inter", system-ui           // everything else
```

## CARD COMPONENT SHAPE

```
<CardFlipper flipped={flipped}>
  <CardFront>
    <Image />
    <Headline />
    <SoWhatButton state={idle|loading|ready} onClick={...} />
  </CardFront>
  <CardBack>
    <ScoreBadge score={9} />
    <ImpactHeadline />
    <WhyItMatters />
    <BackHint />
  </CardBack>
</CardFlipper>
```

One component. One `flipped` state. Everything else is props. Don't over-decompose.

# SoWhat News — Scope 4: Landing Page (Pre-Demo Front Door)

**Stack:** Next.js (App Router) + Vercel. No new deps.
**Duration:** 4 hours.
**Builds on:** scope-3.md brand tokens (cream bg, yellow CTA, Playfair + Inter). Waitlist route already exists at `/waitlist` + `app/api/waitlist/route.ts`.
**Magic moment:** Judge opens the URL expecting a product and gets a full cream landing page with a serif headline that explains the whole app in one sentence, two buttons, and a subtle flipping-card hero that hints at — but doesn't spoil — the product. 20 seconds of "oh, this is polished," then they click **Start Using** and the real demo begins.

---

## PROJECT
SoWhat News v4 — a **static marketing landing page at `/`** that frames the app for a first-time viewer. Current app feed moves to `/app`. Two CTAs: **Start Using** (primary, yellow) → `/app`, and **Join Waitlist** (secondary, outline) → `/waitlist`. No new backend, no new state, no API calls on the landing page. This is a copy + layout exercise wearing scope-3's brand clothes.

## ITERATION 0 (20 min) — Copy first. Everything else is CSS.
**Not a terminal command. The core unknown is whether the copy lands.**

Open `buildathon-doc/landing-copy.md` (trash after). Write, in plain English:

- **Hero headline** (one line, ≤10 words). Candidate: *"News told you what happened. We tell you why it matters to you."* Or shorter: *"News, scored for your life."* Iterate until a cold reader gets the app in 3 seconds.
- **Subheadline** (1 sentence, ≤20 words). Example: *"Pick who you are. Tap any headline. Get a personal take and a relevance score from 1–10."*
- **3 "how it works" steps**, 4 words each max: *1. Pick your persona. 2. Tap "So What?" 3. See what actually matters.*
- **Button labels**: confirm `Start Using` vs `Try it now` vs `Open app`. And `Join Waitlist` vs `Get updates`.

**Rule:** if you can't show this markdown to someone with no context and have them understand the app, the landing page is broken. Do not open a `.tsx` file until someone has read this and gotten it.

## ITERATION 1 (1 hr) — Route shuffle + static landing shell
- **Move app feed:** rename `app/page.tsx` → `app/app/page.tsx` (or `app/feed/page.tsx` — pick one). Grep for `href="/"`, `router.push('/')`, `<Link href="/">`. Fix all of them to point at the new route. Expect < 5 hits.
- **New `app/page.tsx`** = landing page. Server component, no `"use client"` unless needed for the hero animation.
- **Reuse scope-3 brand tokens** — pin them in `app/globals.css` as CSS variables if not already:
  ```
  --brand-yellow: #F5D547
  --brand-black:  #111111
  --page-bg:      #FAF7F0
  --text-primary: #1A1A1A
  --text-muted:   #6B6B6B
  ```
  Fonts: `Playfair Display` (display) + `Inter` (body) via `next/font/google`.
- **Page layout (top → bottom):**
  1. Header: logo left, single "Login" link right (or omit entirely — simpler).
  2. Hero: 60vh minimum. Headline (Playfair, ~56px desktop / 36px mobile, bold). Subheadline (Inter, ~18px, muted). Two buttons side-by-side.
     - **Primary**: yellow fill, black text, bold. Links to `/app`. This button wins visual weight by a wide margin.
     - **Secondary**: transparent with thin black border, black text. Links to `/waitlist`.
     - On mobile: stack vertically, primary on top.
  3. "How it works" — 3 numbered cards in a row (1 column mobile). Big number + 4-word title + 1-sentence body.
  4. Footer: logo, copyright, one link row. Done.
- **No hero animation yet.** Just static layout. Show someone on your team — if they don't get it, revise copy before touching CSS.

## ITERATION 2 (1 hr) — Hero visual that teases the flip (without spoiling it)
- **Right side of hero:** a single portrait card mock, stacked slightly off-axis. Front face showing headline + image + yellow "So What?" button. Subtle CSS animation: every 4 seconds, the button pulses. Every 12 seconds, the card does a partial tilt (`rotateY(15deg)` and back) — hinting at the flip without performing it. Keeps the real flip as a surprise in the app.
- **Alternative if the partial-tilt feels weak:** a looping auto-flip with 3 hardcoded results cycling through (`9/10` for Tech Investor, `2/10` for same, `7/10` for Teacher). Demonstrates the range, but risks spoiling the flip mechanic. Gut check in the moment.
- **"How it works" polish:** each step gets a small illustrative element — a persona chip for step 1, a yellow button glyph for step 2, a relevance badge for step 3. Don't over-design; a colored square + icon each is fine.
- **Meta:** `<title>` = "SoWhat News — News that knows who you are." Basic OG image (screenshot of hero, committed as `public/og.png`).
- **Responsive pass:** test at 375px, 768px, 1440px. Hero stacks, buttons full-width on mobile.

## ITERATION 3 (1 hr — pick ONE)
- **(a) Scroll polish** — `IntersectionObserver` fade-up on "How it works" and footer. Subtle cream→white page gradient. Add a "Built for demo day" footer microline. Cheapest, safest, looks expensive.
- **(b) Live persona picker in the hero** — 3 dropdowns + a "see example" button that swaps the hero card's front → back with a pre-rendered result for that persona. Tempting, but it's a second version of the app on the landing page AND gates the "oh" on it working.

**Recommendation: (a).** (b) duplicates product logic, steals the demo, and doubles your surface area.

## DEMO MOMENT
Judge opens the URL → cream page, serif headline reads "News told you what happened. We tell you why it matters to you." Off to the side, a portrait card tilts subtly and the yellow button pulses. Two buttons below. The pitch is understood in 3 seconds. Judge clicks **Start Using** → app feed loads, scope-2/3 demo runs. Total time on landing: 15–20 seconds. That's the point. It's a handshake, not the conversation.

## NOT BUILDING
- Auth, login UI beyond a text link (waitlist is the only data collection)
- New waitlist backend (already exists)
- Blog, about, pricing, terms, privacy pages
- Testimonials section (no users to quote)
- Analytics beyond Vercel's default Web Analytics
- Email confirmation / double opt-in flow
- Animation libraries (Framer Motion, GSAP) — pure CSS
- Video hero / Lottie
- Light/dark mode toggle
- Internationalization
- SEO sitemap, robots.txt deep config
- Logo redesign
- The full flip in the hero (spoils the product)

## FAKING
- "How it works" step icons — simple colored squares or emoji, not custom illustrations
- OG image — static screenshot of the hero, not dynamically generated
- Any "trusted by N readers" counter — hardcoded, if used at all (probably skip; feels desperate for a demo)
- The hero card is a static mock, not a real `<NewsCard>` instance (don't couple landing to the feed component's data shape)

---

## RISKS

### 1. The route move breaks scope-3 work
Current `app/page.tsx` IS the feed. Moving it to `/app` breaks any hardcoded `/` links scope-3 might have introduced, plus any redirects.

**Mitigation:** do the route move FIRST, verify the app still works at `/app`, then build the landing. Don't build both in parallel. Grep `href="/"` and `router.push('/')` before starting — there should be fewer than 5 hits.

### 2. Copy is the whole game; you'll be tempted to skip Iteration 0
Landing pages fail on words, not CSS. 20 min on copy is the highest-leverage slice of the whole scope.

**Mitigation:** literally don't open a `.tsx` file until the markdown copy is written and you've shown it to one person (teammate, spouse, LLM — anyone). If they can't repeat the app's value back in one sentence, the copy isn't done.

### 3. Two-CTA visual equality kills conversion
If "Start Using" and "Join Waitlist" look equally weighted, judges will hesitate. Decision paralysis on a landing page is death.

**Mitigation:** primary button is filled yellow with black text, bold. Secondary is transparent with a 1px black border and muted text. ~5× visual weight difference. The judge should feel pulled to "Start Using" without thinking.

### 4. The hero animation spoils the flip
If the landing page shows the full 3D flip, the in-app flip loses its "oh" moment 20 seconds later. The product's best beat is stolen by its own marketing.

**Mitigation:** tease, don't reveal. Partial tilt (15°) + pulsing button. Or show a card that's already flipped to the back from frame 1, so the transition itself is held back for the app. Do NOT auto-flip a full 180° on the landing page.

### 5. Scope-3 brand tokens may not exist yet
If scope-3 hasn't shipped, the cream bg + yellow + Playfair + Inter tokens only live in this doc. The landing page will use them before the app does.

**Mitigation:** pin the tokens in `app/globals.css` as part of Iteration 1. The landing page adopting them first is fine — it forces scope-3 to inherit them. Single source of truth.

### 6. Mobile hero layout
Two CTAs + hero card illustration + headline all fit badly on a 375px screen. Easy to end up with a hero that's 1200px tall on mobile.

**Mitigation:** on mobile, drop the hero card illustration entirely. Just headline + subhead + stacked buttons. The card reappears at ≥768px. This is fine; judges will be on a laptop.

---

## ROUTES AFTER THIS SCOPE

```
/             → landing page (new)
/app          → news feed (was /, scope-2 + scope-3 lives here)
/waitlist     → existing
/api/*        → unchanged
```

## COMPONENT SHAPE

```
app/page.tsx               (server component, landing)
  components/landing/Header.tsx
  components/landing/Hero.tsx           (client — for the pulse animation)
  components/landing/HeroCardMock.tsx   (client — tilt + pulse only)
  components/landing/HowItWorks.tsx
  components/landing/Footer.tsx
```

Keep landing components in `components/landing/` so they don't bleed into the feed's component tree. No shared components between landing and app beyond the logo.

## COPY SEED (starting point, rewrite in Iteration 0)

```
Hero H1:      News told you what happened.
              We tell you why it matters to you.
Subhead:      Pick who you are. Tap any headline. Get a personal take
              and a relevance score from 1–10.
Step 1:       Pick your persona. Tech investor? Teacher? Parent? All three?
Step 2:       Tap "So What?" on any headline.
Step 3:       See what actually matters to your life — and skip what doesn't.
CTA primary:  Start Using
CTA second:   Join Waitlist
```

Do not ship the seed. Rewrite it.

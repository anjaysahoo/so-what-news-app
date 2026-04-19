# Landing Copy — Iteration 0

**Goal:** A cold reader understands the app in 3 seconds. If they don't, the page is broken.
**Test:** Show this file to one human (teammate, partner, LLM). Ask: "What does this app do?" If their answer isn't roughly *"shows me news scored by how much it matters to me personally,"* rewrite.

Trash this file once `app/page.tsx` ships.

---

## HERO HEADLINE (≤10 words, one line)

Pick ONE. Read each out loud. The winner is the one a stranger on the bus would understand.

1. **News told you what happened. We tell you why it matters to you.** *(seed — 12 words, two sentences, slightly long but the contrast is the whole pitch)*
2. **News, scored for your life.** *(5 words, opaque without subhead — leans on "scored")*
3. **The news, ranked by how much it matters to you.** *(10 words, plain — boring but clear)*
4. **Stop reading news that doesn't matter to you.** *(8 words, negative framing, punchy)*
5. **Every headline, scored 1–10 for your life.** *(8 words, leads with the mechanic)*

**Pick:** _____ *(circle one before opening a tsx file)*

**Anti-pattern check:** if your pick contains "AI-powered," "personalized," "curated," or "intelligent" — rewrite. Those words are landing-page wallpaper.

---

## SUBHEADLINE (1 sentence, ≤20 words)

Pick ONE. Should explain the *mechanic* in one breath — what does the user actually do.

1. **Pick who you are. Tap any headline. Get a personal take and a relevance score from 1–10.** *(seed — 19 words, three short sentences, mirrors how-it-works)*
2. **Tell us who you are. We score every headline 1–10 for how much it actually matters to your life.** *(20 words, single sentence, "we" voice)*
3. **You're a tech investor and a parent. Same headline, different scores. That's the point.** *(15 words, shows don't tell — strongest if hero card uses these two personas)*
4. **One headline. Multiple personas. A relevance score that changes based on who's reading.** *(14 words, abstract — weakest unless the visual carries it)*

**Pick:** _____

---

## HOW IT WORKS — 3 STEPS (≤4 words each title, 1 sentence body)

| # | Title (≤4 words) | Body (1 sentence) |
|---|---|---|
| 1 | **Pick your persona.** | Tech investor, teacher, parent — or all three at once. |
| 2 | **Tap "So What?"** | We score the headline 1–10 for your life and explain why. |
| 3 | **Skip what doesn't matter.** | Cards scoring ≤3 fade out. Your time goes to what actually moves you. |

Alt step 3 candidates:
- *See what actually matters.* *(seed — softer, less mechanism)*
- *Read what counts. Skip what doesn't.* *(parallel, punchier, 6 words — over budget)*

**Tension:** step 3 either reveals the fade-out behavior (honest, technical) or stays poetic. Lean technical — judges reward specificity.

---

## BUTTON LABELS

### Primary CTA (yellow, bold) → `/app`

| Option | Pros | Cons |
|---|---|---|
| **Start Using** | seed, action verb, no friction | "using" is vague — using *what*? |
| **Try it now** | low commitment, common pattern | over-used, slightly cheap |
| **Open app** | honest, mechanical | feels like a returning-user button, not a discovery one |
| **See it work** | curiosity-driven, demo-friendly | passive — doesn't say *try* |

**Pick:** _____ *(my vote: **Try it now** — lowest friction for a 20-second judge attention span; "Start Using" implies signup which there isn't)*

### Secondary CTA (outline) → `/waitlist`

| Option | Pros | Cons |
|---|---|---|
| **Join Waitlist** | seed, conventional, says what it is | "waitlist" implies you can't use it now — contradicts the primary CTA |
| **Get updates** | softer, no contradiction with "Try it now" | doesn't capture intent — could mean newsletter |
| **Notify me** | personal, low-commitment | vague — notify about what |

**Pick:** _____ *(my vote: **Get updates** — avoids the "wait" contradiction with the primary CTA. The product is live; the waitlist is for what's next.)*

---

## FOOTER MICROLINE (Iteration 3, optional)

- *Built for demo day. Not for sale.*
- *A 4-hour buildathon experiment.*
- *© 2026 SoWhat News. Built fast.*

---

## VALIDATION CHECKLIST

Before opening `app/page.tsx`:

- [ ] Read the hero + subhead out loud. Does it sound like a human or a SaaS template?
- [ ] Show the file (just the picks, not the alternatives) to ONE person who hasn't seen the app.
- [ ] Ask them: "What does this do? Who's it for? What would you do on this page?"
- [ ] If they hesitate >5 seconds on any of those, rewrite the relevant slot.
- [ ] Confirm: primary CTA verb ≠ secondary CTA verb (no "Start" + "Sign up" — both are commitment).
- [ ] Confirm: no buzzwords (AI, personalized, curated, intelligent, smart, powered).

When all six are checked → start Iteration 1.

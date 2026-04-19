# Feature Specification: SoWhat News App — Contextual Utility News Engine

**Feature Branch**: `001-sowhat-news-mvp`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "Build a Contextual Utility News Engine that translates generic news events into personalized, action-oriented impact summaries using an anonymous persona model based on life anchors."

## Clarifications

### Session 2026-04-17

- Q: How should "daily" be defined for feed refresh and story corpus boundaries? → A: Use UTC calendar day boundaries, with shared top stories refreshed at 00:00 UTC.
- Q: What identifier should enforce the 3 requests per 24 hours rate limit? → A: Enforce server-side limits keyed by an anonymous device token sent by the client.
- Q: If AI transformation fails for some stories, should the feed still render? → A: Yes, use partial success: render available personalized cards and show per-item fallback for failed transformations.
- Q: How should rate-limit identifiers be stored for privacy and retention? → A: Store only hashed anonymous device tokens with automatic expiry after 48 hours.
- Q: What accessibility target should the MVP enforce? → A: Enforce WCAG 2.1 AA for onboarding, feed, and error/rate-limit states.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Persona Creation via Life Anchors (Priority: P1)

A first-time visitor arrives at the app and defines their anonymous persona by selecting three "Life Anchors": Career/Industry, Financial Profile, and Housing/Life Stage. The selections are remembered across browser sessions so the visitor never has to re-enter them.

**Why this priority**: Without a persona, the core impact algorithm has nothing to personalize against. This is the foundational input for all downstream value.

**Independent Test**: Can be fully tested by visiting the app, selecting three dropdowns, closing the browser, reopening the app, and verifying the selections persist. Delivers value by confirming the privacy-first, zero-PII data collection model works.

**Acceptance Scenarios**:

1. **Given** a first-time visitor on the landing page, **When** they see the onboarding interface, **Then** three selection inputs are displayed for Career/Industry, Financial Profile, and Housing/Life Stage, each populated with predefined options.
2. **Given** a visitor has not yet selected all three anchors, **When** they attempt to generate their impact feed, **Then** the system prevents the action and indicates which selections are missing.
3. **Given** a visitor has selected all three anchors and triggered feed generation, **When** they close and reopen the browser, **Then** the previously selected anchors are automatically restored without any login or account creation.
4. **Given** a returning visitor with persisted selections, **When** they want to change their persona, **Then** they can modify any anchor and regenerate their feed with the updated profile.

---

### User Story 2 — Personalized Impact News Feed Generation (Priority: P1)

After defining their persona, the user triggers feed generation and receives a curated set of the day's top news stories, with each card showing personalized impact content when available and a graceful per-item fallback when personalization fails.

**Why this priority**: This is the core value proposition — transforming generic news into personally relevant, actionable intelligence. Without it, the app has no reason to exist.

**Independent Test**: Can be tested by selecting a persona (e.g., Tech/Software, Active Investor, Renter), clicking "Generate My Daily Impact," and verifying that 5 news cards appear, each with the original headline and source link plus either personalized impact content or a fallback note when personalization is unavailable.

**Acceptance Scenarios**:

1. **Given** a user with a complete persona, **When** they request their daily impact feed, **Then** the system returns exactly 5 news items, each containing the original headline and source link, and either (a) a personalized impact headline (10–15 words) with a 2-sentence impact summary or (b) a clear note that personalization is temporarily unavailable for that item.
2. **Given** a user has requested their feed, **When** the system is processing, **Then** placeholder loading indicators appear for each of the 5 card positions.
3. **Given** two users with different personas, **When** both generate their feeds on the same day, **Then** they receive the same underlying news stories and, for successfully personalized items, different personalized headlines and summaries tailored to their respective life anchors.
4. **Given** a user views an impact card, **When** they want to read the full original article, **Then** clicking the source link opens the original news source in a new tab.

---

### User Story 3 — Graceful Error and Rate-Limit Handling (Priority: P2)

When something goes wrong — the AI service is slow, the news source is unavailable, or the user exceeds their daily limit — the app communicates clearly and helpfully instead of showing a broken experience.

**Why this priority**: A polished error experience is essential for trust and retention, especially for an AI-powered product where failures are more likely than in static content apps.

**Independent Test**: Can be tested by exceeding the daily request limit (3 requests per 24 hours from the same device) and verifying a clear, friendly message is displayed explaining the limit and when the user can return.

**Acceptance Scenarios**:

1. **Given** a user has already made 3 feed requests in a 24-hour window, **When** they attempt a 4th request, **Then** the system displays a friendly message explaining the daily limit and approximately when they can try again.
2. **Given** the AI transformation service is temporarily unavailable, **When** a user requests their feed, **Then** the system displays a user-friendly error message suggesting they try again shortly, without exposing technical details.
3. **Given** the news source is unreachable, **When** feed generation is attempted, **Then** the system informs the user that news could not be retrieved and suggests retrying later.

---

### User Story 4 — Mobile-First Responsive Experience (Priority: P2)

The app delivers a clean, modern, mobile-optimized reading experience that scales gracefully to tablet and desktop viewports and remains accessible to keyboard and assistive-technology users.

**Why this priority**: The target audience consumes news primarily on mobile devices. A poor mobile experience would undermine adoption regardless of how good the personalization is.

**Independent Test**: Can be tested by loading the app on various viewport sizes (320px mobile, 768px tablet, 1440px desktop), verifying all elements are readable and touch-friendly, and confirming onboarding/feed/error flows meet WCAG 2.1 AA checks.

**Acceptance Scenarios**:

1. **Given** a user on a mobile device (viewport ≤ 480px), **When** they view the feed, **Then** cards stack vertically with full-width layout, touch-friendly controls, and readable text without horizontal scrolling.
2. **Given** a user on a desktop browser (viewport ≥ 1024px), **When** they view the app, **Then** the layout uses appropriate max-width constraints and centered content for comfortable reading.
3. **Given** any viewport size, **When** the user interacts with the persona selection or feed, **Then** all interactive elements meet minimum touch-target sizes and have clear visual feedback.
4. **Given** a keyboard or screen-reader user, **When** they complete onboarding, generate feed, or view error/rate-limit messages, **Then** the experience meets WCAG 2.1 AA expectations including focus visibility, semantic labeling, and sufficient color contrast.

---

### Edge Cases

- What happens when the news source returns fewer than 5 headlines? The system processes and displays however many are available (1–4 cards) without error.
- What happens when one or more AI transformations fail (timeout, invalid structure, or provider error)? The system still renders all cards, using personalized output for successful items and original-headline fallback with a note for failed items.
- What happens when the user's browser has localStorage disabled or full? The app still functions for the current session but displays a notice that preferences won't persist across visits.
- What happens when the same user requests their feed multiple times within the rate limit? Each request regenerates personalized headlines from the current UTC-day corpus without requiring users to wait for a previous render.
- What happens when a news article's source link becomes invalid? The link is still displayed but if the user clicks it and the page is unavailable, that's outside the app's control — no in-app error is shown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present three selection inputs for persona creation: Career/Industry, Financial Profile, and Housing/Life Stage, each with predefined option sets.
- **FR-002**: System MUST persist selected persona anchors in the user's browser across sessions without requiring account creation, login, or any personally identifiable information.
- **FR-003**: System MUST prevent feed generation until all three persona anchors are selected, with clear indication of what's missing.
- **FR-004**: System MUST fetch the top 5 headlines from the current UTC calendar day corpus from a news aggregation source when feed generation is triggered; the shared daily corpus MUST refresh at 00:00 UTC.
- **FR-005**: System MUST attempt to transform each fetched news story into an impact item; each rendered card MUST include the original headline and original article URL, plus either personalized content (10–15 word impact headline and 2-sentence impact summary) or a fallback note when personalization for that item fails.
- **FR-006**: System MUST display a loading state with placeholder cards while news is being fetched and transformed.
- **FR-007**: System MUST enforce a rate limit of 3 feed generation requests per anonymous device token per 24-hour rolling window, where the token is sent by the client and contains no personally identifiable information; server-side persistence for rate limiting MUST store only a hashed token value with automatic expiry after 48 hours.
- **FR-008**: System MUST display a user-friendly message when the rate limit is exceeded, indicating when the user can next generate their feed.
- **FR-009**: System MUST display user-friendly error messages when the AI service or news source is unavailable, without exposing technical details.
- **FR-010**: System MUST render a responsive, mobile-first layout that adapts to mobile (≤ 480px), tablet (481–1023px), and desktop (≥ 1024px) viewports.
- **FR-013**: System MUST meet WCAG 2.1 AA accessibility expectations for onboarding, feed, and error/rate-limit states, including keyboard navigability, visible focus indicators, semantic form labeling, and sufficient text/background contrast.
- **FR-011**: Each impact card MUST include a "Why this matters to you" badge and a footer with the original headline and source link, plus either personalized impact content or a fallback note when personalization is unavailable.
- **FR-012**: System MUST allow returning users to modify their persona anchors and regenerate the feed with updated selections.

### Predefined Option Sets

- **Career/Industry**: Tech/Software, Healthcare, Finance/Banking, Education, Retail/E-Commerce, Manufacturing, Government, Student, Retired, Other
- **Financial Profile**: Salaried, Freelancer/Self-Employed, Active Investor, Business Owner, Debt Payoff Focus, Student/No Income
- **Housing/Life Stage**: Renter, Homeowner, Parent with Young Kids, Parent with Teens, Single/No Dependents, Caretaker of Elders

### Key Entities

- **Anonymous Persona**: A collection of three life anchor selections (Career/Industry, Financial Profile, Housing/Life Stage) stored locally on the user's device. Has no identity, no account, no server-side record.
- **Anonymous Device Token**: A non-PII identifier stored on the client and included with feed-generation requests only for server-side rate limiting across browser sessions on the same device/browser profile. The server stores only a hashed representation of this token with a 48-hour auto-expiry.
- **Impact News Item**: A news card generated per request containing original headline and original source URL, plus either personalized impact headline (10–15 words) and personalized impact summary (2 sentences) or a fallback note when personalization is unavailable.
- **Daily News Story**: A raw headline and URL fetched from an external news source, serving as input to the AI transformation layer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: First-time users can complete persona setup and see their first personalized feed in under 60 seconds from landing on the app.
- **SC-002**: For successfully personalized items, impact headlines are contextually relevant to the user's selected persona — a user with "Tech/Software" + "Active Investor" sees different impact angles than a user with "Healthcare" + "Renter" for the same underlying news story.
- **SC-003**: 95% of feed generation requests complete and display results to the user in under 15 seconds.
- **SC-004**: Users who return to the app find their persona selections intact and can generate a new feed in under 10 seconds (no re-onboarding).
- **SC-005**: The app is fully usable on mobile devices with screens as small as 320px wide, with no horizontal scrolling or truncated content.
- **SC-006**: When errors or rate limits occur, 100% of failure scenarios show a clear, non-technical message — no raw error codes, blank screens, or broken layouts.
- **SC-007**: Zero personally identifiable information is collected, transmitted, or stored at any point in the user journey.
- **SC-008**: Accessibility validation for onboarding, feed, and error/rate-limit flows passes WCAG 2.1 AA gates in release checks (no critical accessibility defects and full keyboard completion of core flows).

## Assumptions

- Users have a modern browser with JavaScript enabled (Chrome, Safari, Firefox, Edge — latest 2 major versions).
- Users have a stable internet connection; the app is not designed for offline use in the MVP.
- The external news source provides at least 5 English-language headlines per UTC calendar day for a global audience.
- Rate limiting by anonymous device token is a sufficient abuse-prevention mechanism for the MVP; the server stores only hashed token values with 48-hour expiry and does not persist raw token identifiers.
- The AI model produces reasonably accurate and useful personalization; fine-tuning prompt quality is an ongoing effort, not a launch blocker.
- The predefined option sets for life anchors cover the majority of user profiles; "Other" is available as a catch-all for Career/Industry.
- The app launches with English-language content only; multi-language support is out of scope for the MVP.
- No user authentication, no server-side user storage, no push notifications, and no email digests — as defined in the PRD's "Out of Scope" section.

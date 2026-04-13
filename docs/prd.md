
# Product Requirements Document (PRD): Impact News MVP

## 1. Executive Summary
**Product Name:** SoWhat News App
**Objective:** Build a "Contextual Utility News Engine" that translates generic news events into personalized, action-oriented impact summaries. It shifts the focus from "what happened" to "how this affects you."
**Platform:** Responsive Web Application (Mobile-first, desktop-scalable).
**Privacy Model:** Zero-PII (Personally Identifiable Information). Uses an "Anonymous Persona" model based on life anchors.

## 2. Technical Stack
* **Framework:** Next.js (React for the frontend, API Routes for the backend).
* **Styling:** Tailwind CSS (for rapid, responsive mobile-first UI).
* **State Management:** React Hooks + Browser Local Storage (to persist user settings).
* **Rate Limiting / Caching:** Redis (Upstash recommended, utilizing their REST API for Edge compatibility).
* **Deployment:** Cloudflare Pages (using `@cloudflare/next-on-pages`).
* **Runtime Constraints:** API routes must utilize the Edge Runtime (V8 isolates) since Cloudflare Pages relies on Cloudflare Workers, meaning standard Node.js native modules cannot be used.
* **External APIs:**
    * **News Ingestion:** Free tier News API (e.g., NewsAPI.org, GNews, or similar) to fetch top 5 daily headlines.
    * **LLM Provider:** Fast, low-cost model (e.g., Google Gemini 1.5 Flash, OpenAI GPT-4o-mini, or Anthropic Claude 3 Haiku).

---

## 3. User Flow & UI Specifications

### 3.1. Onboarding & Persona Creation
* **Layout:** Clean, single-page interface. No account creation, login, or email capture.
* **Inputs:** Three simple dropdown menus to define the "Life Anchors":
    1.  **Career/Industry:** (e.g., Tech/Software, Healthcare, Retail/Service, Student, Retired)
    2.  **Financial Profile:** (e.g., Salaried, Freelancer/Gig, Active Investor, Debt Payoff)
    3.  **Housing/Life Stage:** (e.g., Renter, Homeowner, Parent, Single)
* **Action:** A prominent "Generate My Daily Impact" CTA button.

### 3.2. State Persistence
* Once a user selects their dropdowns and generates news, the 3 "Life Anchors" must be saved to the browser's `localStorage`.
* On return visits, the dropdowns should auto-populate with the saved anchors.

### 3.3. The News Feed (Main View)
* **Loading State:** A skeleton loader or spinner while the LLM processes the news.
* **UI Component:** A vertical scroll of "Impact Cards".
* **Card Structure:**
    * **Label:** "Why this matters to you"
    * **Impact Headline:** Bold, 10-15 words. Focuses on utility/action.
    * **Context:** 2-sentence summary explaining the connection between the raw news and the user's life.
    * **Source:** The original generic headline + a link to the raw article (for credibility).

---

## 4. Backend Logic & Data Pipeline

### 4.1. The API Route (`/api/generate-impact`)
The Next.js backend will expose a single POST endpoint running on the **Edge Runtime**. It must execute the following sequence:

1.  **IP Extraction & Rate Limiting:**
    * Extract the incoming request's IP address from Cloudflare's headers (e.g., `cf-connecting-ip`).
    * Check the IP against the Upstash Redis database via HTTP/REST.
    * **Constraint:** Maximum of **3 requests per IP per rolling 24-hour window**.
    * If exceeded, return `HTTP 429 Too Many Requests` with a user-friendly error message.
2.  **News Fetching:**
    * Ping the News API using the standard native `fetch` API to grab the top 5 current national/global headlines and their brief descriptions.
3.  **LLM Transformation:**
    * Construct a system prompt combining the user's payload (the 3 Life Anchors) and the 5 raw news items.
    * Send the prompt to the LLM provider using Edge-compatible fetch requests.
4.  **Response Delivery:**
    * Return a structured JSON array to the frontend.

### 4.2. Prompt Engineering Specification
The backend must strictly instruct the LLM to return JSON. Use the following prompt structure as the baseline:

```text
You are a Contextual News Translator. 
User Persona: Industry: [Field 1], Financials: [Field 2], Life Stage: [Field 3].

Below are 5 current news stories. For each story, explain the direct, practical impact on this specific user persona. Use the second person ("You"). 

Return ONLY a JSON array of objects with the following keys:
- originalHeadline: The raw news headline.
- originalUrl: The link to the story.
- impactHeadline: A 10-15 word personalized headline focusing on utility.
- impactSummary: A 2-sentence explanation of how this affects the user's wallet, job, or lifestyle.
```

### 4.3. Expected JSON Payload (Output to Frontend)
```json
[
  {
    "originalHeadline": "Central Bank raises interest rates by 0.5%",
    "originalUrl": "https://example.com/news/123",
    "impactHeadline": "Your rent renewal might be more expensive next month.",
    "impactSummary": "The rate hike increases borrowing costs for landlords. Since you are a renter, expect your landlord to pass these costs onto you during your next lease renewal."
  }
]
```

---

## 5. Security & Constraints

* **API Key Protection:** All API keys (News API, LLM API, Redis URI) must be stored as Cloudflare Environment Variables and strictly accessed server-side via the Edge API routes. They must *never* be exposed to the client (do not use `NEXT_PUBLIC_` prefixes for these keys).
* **Error Handling:** The frontend must gracefully handle `429` (Rate Limit), `500` (Server/LLM fail), and timeout errors with clear, polite UI messages.
* **Payload Validation:** The API route must validate the incoming POST request to ensure the 3 persona fields exist and are strings before hitting the LLM to prevent prompt injection or empty generations.

---

## 6. Out of Scope for MVP
To maintain a lean launch, the following are strictly excluded:
* User Authentication (OAuth, Passwords).
* Database storage of generated news or user profiles (using Local Storage only).
* Push notifications, email digests, or native mobile app wrappers.
* "Bring Your Own Key" (BYOK) functionality.
* Pagination or historical news archives.


**Product Requirements Document (PRD)**

**SoWhat?** (Tagline: The news. But for you.)

## **1\. Executive Summary**

**Product Name:** SoWhat News App

**Objective:** Build a "Contextual Utility News Engine" that translates generic news events into personalized, action-oriented impact summaries. It shifts the focus from "what happened" to "how this affects you."

**Platform:** Responsive Web Application (Mobile-first, desktop-scalable).

**Privacy Model:** Zero-PII. Uses an "Anonymous Persona" model based on life anchors.

## **2\. Technical Stack**

### **Frontend (Deployed via Cloudflare Pages)**

* **Framework:** React (Next.js App Router or Vite).
* **UI Components:** **ShadCN UI** \+ Tailwind CSS (using standard components like Cards, Select dropdowns, Buttons, and Skeleton loaders).
* **State Management:** **Zustand** (specifically utilizing the persist middleware to save persona data seamlessly to browser localStorage).
* **Data Fetching:** **TanStack Query** (React Query) to handle fetching, caching, loading states, and error handling from the backend API.
* **Form Validation:** **Zod** (to validate user inputs before hitting the backend).

### **Backend (Deployed via Cloudflare Workers / Edge Runtime)**

* **API Framework:** **Hono.js** (Lightweight, natively optimized for Cloudflare Edge).
* **API Specification:** **OpenAPI 3.0** (Auto-generated using @hono/zod-openapi to maintain strict synchronization between the backend logic and API documentation).
* **AI Orchestration:** **Vercel AI SDK** (Specifically the generateObject function, which guarantees structured JSON outputs from the LLM).
* **Data Validation:** **Zod** (Shared schemas to validate incoming API requests and define the exact structure of the LLM output).
* **Rate Limiting:** Upstash Redis (REST API compatible with Cloudflare Edge).
* **LLM Provider:** Fast, low-cost model (e.g., Google Gemini 1.5 Flash, OpenAI GPT-4o-mini).

## **3\. User Flow & UI Specifications**

### **3.1. Onboarding & Persona Creation**

* **Layout:** Clean, single-page interface using ShadCN layout components. No account creation.
* **Inputs:** Three ShadCN \<Select\> components to define the "Life Anchors":
    1. **Career/Industry:** (e.g., Tech/Software, Healthcare, Retail, Student, Retired)
    2. **Financial Profile:** (e.g., Salaried, Freelancer, Active Investor, Debt Payoff)
    3. **Housing/Life Stage:** (e.g., Renter, Homeowner, Parent, Single)
* **Action:** A ShadCN \<Button\> for "Generate My Daily Impact."

### **3.2. State Persistence (Zustand)**

* The 3 "Life Anchors" state will be managed by a Zustand store.
* Using Zustand's persist middleware, this state is automatically synchronized with localStorage. On return visits, the Zustand store initializes from localStorage, instantly populating the ShadCN Select components.

### **3.3. The News Feed (Main View)**

* **Loading State:** TanStack Query handles the isLoading state, rendering ShadCN \<Skeleton\> cards while the LLM processes.
* **UI Component:** A vertical stack of ShadCN \<Card\> components.
* **Card Structure:**
    * **Header:** "Why this matters to you" badge.
    * **Impact Headline:** Bold, 10-15 words focusing on utility.
    * **Content:** 2-sentence summary explaining the impact.
    * **Footer:** Original headline \+ source link.

## **4\. Backend Logic & Data Pipeline**

### **4.1. The API Route Structure (Hono \+ OpenAPI)**

The backend will use @hono/zod-openapi to expose a type-safe POST endpoint (e.g., /api/generate-impact).

1. **Request Validation (Zod):**
    * The endpoint requires a Zod schema ensuring the payload contains the 3 string fields (Industry, Financials, Life Stage). If invalid, Hono automatically returns a 400 Bad Request.
2. **IP Extraction & Rate Limiting:**
    * Extract cf-connecting-ip from Cloudflare headers.
    * Check the IP against Upstash Redis. (Max 3 requests per 24 hours). Return 429 Too Many Requests if exceeded.
3. **News Fetching:**
    * Fetch the top 5 daily headlines from a standard News API using Edge-compatible fetch.

### **4.2. AI Transformation (Vercel AI SDK \+ Zod)**

Instead of relying on prompt engineering alone to get valid JSON, the backend will use the Vercel AI SDK's generateObject method.

* **The Zod Output Schema:**  
  ```js
        const impactSchema = z.object({  
              newsItems: z.array(z.object({  
              originalHeadline: z.string(),  
              originalUrl: z.string().url(),  
              impactHeadline: z.string().describe("A 10-15 word personalized headline"),  
              impactSummary: z.string().describe("A 2-sentence explanation of the impact")  
          }))  
          });
    ```
  

* **Execution:** The Vercel AI SDK passes the raw news, the user persona, and the impactSchema to the LLM. The SDK forces the LLM to return data that perfectly matches the Zod schema, entirely eliminating JSON parsing errors.

### **4.3. Delivery to TanStack Query**

* The Hono API returns the validated JSON object to the frontend.
* TanStack Query receives the data, caches it for the session, and triggers the UI to swap the ShadCN Skeletons for the populated Impact Cards.

## **5\. Security & Constraints**

* **API Key Protection:** All keys (News API, LLM API, Upstash Redis) must be stored securely as Cloudflare Environment Variables and accessed only within the Hono backend.
* **Type Safety:** The OpenAPI specification generated by Hono can be used to generate strict TypeScript types for TanStack Query on the frontend, ensuring end-to-end type safety.
* **Graceful Degradation:** If the LLM times out or the rate limit is hit, TanStack Query will catch the error, and the UI will display a ShadCN \<Alert\> component with a user-friendly message.

## **6\. Out of Scope for MVP**

* User Authentication (OAuth, Passwords).
* Database storage of generated news or user profiles (using Zustand/Local Storage only).
* Push notifications or email digests.
* BYOK (Bring Your Own Key) functionality.
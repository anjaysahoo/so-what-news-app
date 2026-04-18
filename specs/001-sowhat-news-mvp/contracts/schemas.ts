// packages/shared/src/schemas — canonical Zod schemas for SoWhat News.
// This file is the single source of truth consumed by both `packages/web`
// and `packages/api`. The OpenAPI document (`openapi.yaml`) is generated
// from these schemas via `@hono/zod-openapi`.

import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums: Life Anchor option sets
// ---------------------------------------------------------------------------

export const CAREER_INDUSTRY_VALUES = [
  "tech_software",
  "healthcare",
  "finance_banking",
  "education",
  "retail_ecommerce",
  "manufacturing",
  "government",
  "student",
  "retired",
  "other",
] as const;

export const FINANCIAL_PROFILE_VALUES = [
  "salaried",
  "freelancer",
  "active_investor",
  "business_owner",
  "debt_payoff",
  "student_no_income",
] as const;

export const HOUSING_LIFE_STAGE_VALUES = [
  "renter",
  "homeowner",
  "parent_young_kids",
  "parent_teens",
  "single_no_dependents",
  "caretaker_elders",
] as const;

export const CareerIndustrySchema = z.enum(CAREER_INDUSTRY_VALUES);
export const FinancialProfileSchema = z.enum(FINANCIAL_PROFILE_VALUES);
export const HousingLifeStageSchema = z.enum(HOUSING_LIFE_STAGE_VALUES);

export type CareerIndustry = z.infer<typeof CareerIndustrySchema>;
export type FinancialProfile = z.infer<typeof FinancialProfileSchema>;
export type HousingLifeStage = z.infer<typeof HousingLifeStageSchema>;

// ---------------------------------------------------------------------------
// Persona
// ---------------------------------------------------------------------------

export const PersonaSchema = z
  .object({
    careerIndustry: CareerIndustrySchema,
    financialProfile: FinancialProfileSchema,
    housingLifeStage: HousingLifeStageSchema,
  })
  .strict();

export type Persona = z.infer<typeof PersonaSchema>;

// ---------------------------------------------------------------------------
// Request / Response
// ---------------------------------------------------------------------------

export const GenerateImpactRequestSchema = z
  .object({ persona: PersonaSchema })
  .strict();

export type GenerateImpactRequest = z.infer<typeof GenerateImpactRequestSchema>;

const wordCountRefinement = (min: number, max: number) =>
  (s: string) => {
    const n = s.trim().split(/\s+/).filter(Boolean).length;
    return n >= min && n <= max;
  };

const sentenceCountRefinement = (min: number, max: number) =>
  (s: string) => {
    const n = s.match(/[.!?]+(?=\s|$)/g)?.length ?? 0;
    return n >= min && n <= max;
  };

const PersonalizedImpactItemSchema = z
  .object({
    personalized: z.literal(true),
    originalHeadline: z.string().min(1).max(300),
    originalUrl: z.string().url(),
    source: z.string().min(1).max(120),
    impactHeadline: z
      .string()
      .max(200)
      .refine(wordCountRefinement(10, 15), {
        message: "impactHeadline must be 10–15 words",
      }),
    impactSummary: z
      .string()
      .max(500)
      .refine(sentenceCountRefinement(1, 3), {
        message: "impactSummary must be 1–3 sentences",
      }),
  })
  .strict();

const FallbackImpactItemSchema = z
  .object({
    personalized: z.literal(false),
    originalHeadline: z.string().min(1).max(300),
    originalUrl: z.string().url(),
    source: z.string().min(1).max(120),
    fallbackReason: z.enum([
      "ai_timeout",
      "ai_invalid_output",
      "ai_error",
    ]),
  })
  .strict();

export const ImpactNewsItemSchema = z.discriminatedUnion("personalized", [
  PersonalizedImpactItemSchema,
  FallbackImpactItemSchema,
]);

export type ImpactNewsItem = z.infer<typeof ImpactNewsItemSchema>;

export const GenerateImpactResponseSchema = z
  .object({
    generatedAt: z.string().datetime(),
    corpusDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    newsItems: z.array(ImpactNewsItemSchema).min(1).max(5),
  })
  .strict();

export type GenerateImpactResponse = z.infer<
  typeof GenerateImpactResponseSchema
>;

// ---------------------------------------------------------------------------
// LLM output schema (server-internal, fed to Vercel AI SDK `generateObject`).
// Deliberately relaxed vs the wire schema: refinements are applied *after*
// generation so failing items can be gracefully coerced to the fallback variant.
// ---------------------------------------------------------------------------

export const LlmImpactItemSchema = z
  .object({
    originalHeadline: z.string(),
    originalUrl: z.string().url(),
    impactHeadline: z
      .string()
      .describe("A 10–15 word persona-tailored headline"),
    impactSummary: z
      .string()
      .describe("A 1–3 sentence explanation of personal impact"),
  })
  .strict();

export const LlmImpactBatchSchema = z.object({
  newsItems: z.array(LlmImpactItemSchema).min(1).max(5),
});

export type LlmImpactBatch = z.infer<typeof LlmImpactBatchSchema>;

// ---------------------------------------------------------------------------
// Error envelope
// ---------------------------------------------------------------------------

export const ValidationIssueSchema = z
  .object({
    path: z.string(),
    message: z.string(),
  })
  .strict();

export const ErrorResponseSchema = z.discriminatedUnion("error", [
  z
    .object({
      error: z.literal("validation_failed"),
      message: z.string(),
      issues: z.array(ValidationIssueSchema).optional(),
    })
    .strict(),
  z
    .object({
      error: z.literal("rate_limited"),
      message: z.string(),
      retryAfterSeconds: z.number().int().nonnegative(),
    })
    .strict(),
  z
    .object({
      error: z.literal("news_unavailable"),
      message: z.string(),
    })
    .strict(),
  z
    .object({
      error: z.literal("ai_unavailable"),
      message: z.string(),
    })
    .strict(),
  z
    .object({
      error: z.literal("internal_error"),
      message: z.string(),
      requestId: z.string().optional(),
    })
    .strict(),
]);

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

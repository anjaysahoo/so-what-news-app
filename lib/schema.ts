import { z } from "zod";

export const PersonaSchema = z.object({
  career: z.string().min(1),
  financialProfile: z.string().min(1),
  lifeStage: z.string().min(1),
});
export type Persona = z.infer<typeof PersonaSchema>;

export const ImpactSchema = z.object({
  impactHeadline: z
    .string()
    .describe(
      "Personalized impact headline, 15 words or less, second-person, focused on direct life/wallet/job consequence."
    ),
  whyItMatters: z
    .string()
    .describe("One concise sentence explaining why this matters to the persona specifically."),
});
export type Impact = z.infer<typeof ImpactSchema>;

export const ImpactWithScoreSchema = ImpactSchema.extend({
  relevanceScore: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe(
      "How relevant this headline is to the persona. 1 = no impact on their life. 10 = they need to act on this today. Be harsh — most news is a 2–4 for any given persona."
    ),
});
export type ImpactWithScore = z.infer<typeof ImpactWithScoreSchema>;

export const PersonalizeRequestSchema = z.object({
  headline: z.string().min(1),
  persona: PersonaSchema,
});
export type PersonalizeRequest = z.infer<typeof PersonalizeRequestSchema>;

export const PersonalizeResponseSchema = ImpactWithScoreSchema.extend({
  tookMs: z.number(),
});
export type PersonalizeResponse = z.infer<typeof PersonalizeResponseSchema>;

export const GenerateRequestSchema = z.object({
  persona: PersonaSchema,
});
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

export const ImpactCardSchema = z.object({
  headline: z.string(),
  impactHeadline: z.string(),
  whyItMatters: z.string(),
});
export type ImpactCard = z.infer<typeof ImpactCardSchema>;

export const GenerateResponseSchema = z.object({
  results: z.array(ImpactCardSchema),
  tookMs: z.number(),
});
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

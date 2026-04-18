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

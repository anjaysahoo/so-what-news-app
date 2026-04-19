import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { HEADLINES } from "@/constants/headlines";
import {
  GenerateRequestSchema,
  ImpactSchema,
  type GenerateResponse,
  type Persona,
} from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function rewrite(headline: string, persona: Persona) {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: ImpactSchema,
    prompt: `You are a Personal News Translator. Collide this news with the persona and rewrite the headline as a direct, actionable IMPACT headline — what it means for THEIR wallet, job, or life.

Persona:
- Career: ${persona.career}
- Financial Profile: ${persona.financialProfile}
- Life Stage: ${persona.lifeStage}

Generic headline: "${headline}"

Rules:
- Focus on CONSEQUENCE, not the event.
- Use second-person ("Your", "You") where natural.
- Be concrete and specific — money amounts, timelines, career moves.
- 15 words or less for the headline.`,
  });
  return { headline, ...object };
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid persona payload" }, { status: 400 });
  }

  const { persona } = parsed.data;
  const t0 = Date.now();
  const results = await Promise.all(HEADLINES.map((h) => rewrite(h.headline, persona)));
  const tookMs = Date.now() - t0;

  const payload: GenerateResponse = { results, tookMs };
  return NextResponse.json(payload);
}

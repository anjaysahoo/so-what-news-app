import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
  ImpactWithScoreSchema,
  PersonalizeRequestSchema,
  type PersonalizeResponse,
} from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = PersonalizeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { headline, persona } = parsed.data;
  const t0 = Date.now();

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: ImpactWithScoreSchema,
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
- 15 words or less for the headline.

Rate relevance 1–10. BE BRUTAL. Default to LOW scores. Most news is noise for most people.

Score anchors (use these strictly):
- 1–2: Zero impact. They won't remember this tomorrow.
- 3–4: Skip it. Distant second-order effects at best.
- 5: Mildly interesting. Worth a glance, no action.
- 6–7: Actually relevant. Affects their money/job/life in a measurable way within months.
- 8–9: Act this week. Direct, material hit to their portfolio/salary/rent/career.
- 10: Act TODAY. Emergency-level personal relevance.

Hard rules:
- If the news has no direct connection to the persona's stated career, investments, or life stage → MAX score is 3.
- Second-order macro effects → MAX score is 4. Don't stretch.
- Only score 7+ if you can name the SPECIFIC asset, job, or life expense that gets hit.
- If in doubt, go lower. A score of 6 should feel generous.`,
  });

  const tookMs = Date.now() - t0;
  const payload: PersonalizeResponse = { ...object, tookMs };
  return NextResponse.json(payload);
}

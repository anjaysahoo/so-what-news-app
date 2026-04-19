import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const persona = {
  career: "IT Professional — mid-career software engineer",
  financialProfile: "Active retail investor (stocks + F&O), salaried",
  lifeStage: "30, urban renter, no kids",
};

// Picked to span the relevance spectrum for this persona:
// - HIGH: chips directly hit his portfolio
// - MEDIUM: tax act affects salary but is generic
// - LOW: agri subsidy has no connection to his life
const headlines = [
  "US slaps 25% tariff on semiconductor imports; chip stocks slide 6%.",
  "New Income Tax Act to come into effect April 1, 2026.",
  "Centre announces ₹15,000 cr fertilizer subsidy for kharif season.",
];

const ImpactSchema = z.object({
  impactHeadline: z
    .string()
    .describe(
      "Personalized impact headline, 15 words or less, second-person, focused on direct life/wallet/job consequence."
    ),
  whyItMatters: z
    .string()
    .describe("One concise sentence explaining why this matters to the persona specifically."),
  relevanceScore: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe(
      "How relevant this headline is to the persona. 1 = no impact on their life. 10 = they need to act on this today. Be harsh — most news is a 2–4 for any given persona."
    ),
});

async function rewrite(headline) {
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
- 15 words or less for the headline.

Rate relevance 1–10. BE BRUTAL. Default to LOW scores. Most news is noise for most people.

Score anchors (use these strictly):
- 1–2: Zero impact. They won't remember this tomorrow. (e.g. agri subsidy for an urban renter with no farm exposure)
- 3–4: Skip it. Distant second-order effects at best. (e.g. policy changes in an industry they don't touch)
- 5: Mildly interesting. Worth a glance, no action. (e.g. macro news that might eventually matter)
- 6–7: Actually relevant. Affects their money/job/life in a measurable way within months.
- 8–9: Act this week. Direct, material hit to their portfolio/salary/rent/career.
- 10: Act TODAY. Emergency-level personal relevance.

Hard rules:
- If the news has no direct connection to the persona's stated career, investments, or life stage → MAX score is 3.
- Second-order macro effects ("this could eventually affect inflation which could affect your investments") → MAX score is 4. Don't stretch.
- Only score 7+ if you can name the SPECIFIC asset, job, or life expense that gets hit.
- If in doubt, go lower. A score of 6 should feel generous.`,
  });
  return { headline, ...object };
}

console.log("\n=== SoWhat News — Iteration 0 (v2: relevance scoring) ===\n");
console.log("Persona:");
console.log(`  Career:    ${persona.career}`);
console.log(`  Financial: ${persona.financialProfile}`);
console.log(`  Life:      ${persona.lifeStage}\n`);
console.log(`Scoring ${headlines.length} headlines sequentially...\n`);

const t0 = Date.now();
for (let i = 0; i < headlines.length; i++) {
  const r = await rewrite(headlines[i]);
  console.log(`--- #${i + 1} ---`);
  console.log(`Generic:   ${r.headline}`);
  console.log(`Impact:    ${r.impactHeadline}`);
  console.log(`Why:       ${r.whyItMatters}`);
  console.log(`Relevance: ${r.relevanceScore}/10\n`);
}
const ms = Date.now() - t0;

console.log(`Done in ${ms}ms.`);

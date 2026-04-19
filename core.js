import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const persona = {
  career: "IT Professional — mid-career software engineer",
  financialProfile: "Active retail investor (stocks + F&O), salaried",
  lifeStage: "30, urban renter, no kids",
};

const headlines = [
  "STT hike in Budget triggers 2% market slide; Nifty dips.",
  "New Income Tax Act to come into effect April 1, 2026.",
  "India Semiconductor Mission (ISM) 2.0 launched with ₹1,000cr outlay.",
  "Gold and Silver rates crash by 9% on February 1.",
  "Tax holiday till 2047 for foreign companies using Indian Data Centres.",
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
- 15 words or less for the headline.`,
  });
  return { headline, ...object };
}

console.log("\n=== SoWhat News — Iteration 0 ===\n");
console.log("Persona:");
console.log(`  Career:    ${persona.career}`);
console.log(`  Financial: ${persona.financialProfile}`);
console.log(`  Life:      ${persona.lifeStage}\n`);
console.log("Rewriting 5 headlines in parallel...\n");

const t0 = Date.now();
const results = await Promise.all(headlines.map(rewrite));
const ms = Date.now() - t0;

results.forEach((r, i) => {
  console.log(`--- #${i + 1} ---`);
  console.log(`Generic: ${r.headline}`);
  console.log(`Impact:  ${r.impactHeadline}`);
  console.log(`Why:     ${r.whyItMatters}\n`);
});

console.log(`Done in ${ms}ms (5 parallel calls).`);

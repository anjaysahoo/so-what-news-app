import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const ImpactHeadlineSchema = z.object({
  genericHeadline: z.string(),
  impactHeadline: z.string(),
  whyItMatters: z.string(),
});

const headlines = [
  "STT hike in Budget triggers 2% market slide; Nifty dips.",
  "New Income Tax Act to come into effect April 1, 2026.",
  "India Semiconductor Mission (ISM) 2.0 launched with ₹1,000cr outlay.",
  "Gold and Silver rates crash by 9% on February 1.",
  "Tax holiday till 2047 for foreign companies using Indian Data Centres.",
];

const persona = {
  career: "IT / Software Engineering",
  financialProfile: "Active retail investor (stocks/options), salaried",
  lifeStage: "30, single, renter",
  location: "Bengaluru, India"
};

async function generateImpact(headline) {
  const result = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: ImpactHeadlineSchema,
    prompt: `Given this user persona:
- Career: ${persona.career}
- Financial Profile: ${persona.financialProfile}
- Life Stage: ${persona.lifeStage}
- Location: ${persona.location}

Transform this news headline into a personalized impact statement.

Original headline: "${headline}"

Rules:
- impactHeadline: 10 words max, start with "Your..." or "You..."
- whyItMatters: 1-2 sentences max, be specific to this persona
- Make it actionable and specific to their wallet/job/investments`
  });

  return result.object;
}

async function main() {
  console.log("=== SoWhat News - Impact Generator ===\n");
  console.log("Persona:", persona);
  console.log("\nProcessing headlines...\n");

  const results = await Promise.all(headlines.map(h => generateImpact(h)));

  results.forEach((r, i) => {
    console.log(`--- Headline ${i + 1} ---`);
    console.log(`Generic: ${headlines[i]}`);
    console.log(`Impact:  ${r.impactHeadline}`);
    console.log(`Why:     ${r.whyItMatters}\n`);
  });

  console.log("=== Done! ===");
}

main().catch(console.error);
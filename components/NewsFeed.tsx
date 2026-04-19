"use client";

import { HEADLINES } from "@/constants/headlines";
import type { Persona } from "@/lib/schema";
import { NewsCard } from "./NewsCard";

export function NewsFeed({ persona }: { persona: Persona }) {
  return (
    <section className="mx-auto mt-8 flex max-w-2xl flex-col gap-4">
      {HEADLINES.map((h) => (
        // key includes persona so changing persona resets each card's state
        <NewsCard
          key={`${persona.career}|${persona.financialProfile}|${persona.lifeStage}|${h}`}
          headline={h}
          persona={persona}
        />
      ))}
    </section>
  );
}

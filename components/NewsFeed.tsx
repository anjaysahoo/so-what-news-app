"use client";

import { useRef, useState } from "react";
import { HEADLINES } from "@/constants/headlines";
import type { Persona, PersonalizeResponse } from "@/lib/schema";
import { NewsCard, type Personalized } from "./NewsCard";

type CardState = {
  loading: boolean;
  result: Personalized | null;
  error: string | null;
};

const EMPTY: CardState = { loading: false, result: null, error: null };

export function NewsFeed({ persona }: { persona: Persona }) {
  const [states, setStates] = useState<Record<string, CardState>>({});
  // setState updaters aren't synchronous — ref tracks in-flight across concurrent calls
  const inFlightRef = useRef<Set<string>>(new Set());

  async function personalize(headline: string) {
    if (inFlightRef.current.has(headline)) return;
    const existing = states[headline];
    if (existing?.loading || existing?.result) return;

    inFlightRef.current.add(headline);
    setStates((s) => ({ ...s, [headline]: { ...EMPTY, loading: true } }));
    try {
      const res = await fetch("/api/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, persona }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PersonalizeResponse = await res.json();
      setStates((s) => ({
        ...s,
        [headline]: {
          loading: false,
          error: null,
          result: {
            impactHeadline: data.impactHeadline,
            whyItMatters: data.whyItMatters,
            relevanceScore: data.relevanceScore,
          },
        },
      }));
    } catch (err) {
      console.log("personalize error", err);
      setStates((s) => ({
        ...s,
        [headline]: { loading: false, result: null, error: "Failed to personalize. Try again." },
      }));
    } finally {
      inFlightRef.current.delete(headline);
    }
  }

  return (
    <section className="mx-auto mt-8 flex w-full max-w-[400px] flex-col gap-8">
      {HEADLINES.map((item, i) => {
        const s = states[item.headline] ?? EMPTY;
        return (
          <NewsCard
            key={item.id}
            headline={item.headline}
            image={item.image}
            imageIndex={i}
            loading={s.loading}
            result={s.result}
            error={s.error}
            onSoWhat={() => personalize(item.headline)}
          />
        );
      })}
    </section>
  );
}

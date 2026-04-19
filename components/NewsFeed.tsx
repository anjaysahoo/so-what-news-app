"use client";

import { useMemo, useState } from "react";
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
  // keyed by headline string
  const [states, setStates] = useState<Record<string, CardState>>({});
  const [sortByRelevance, setSortByRelevance] = useState(false);

  async function personalize(headline: string) {
    const current = states[headline] ?? EMPTY;
    if (current.loading || current.result) return;

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
    }
  }

  const personalizedCount = useMemo(
    () => Object.values(states).filter((s) => s.result).length,
    [states]
  );

  // Sort: personalized cards high→low by score, then un-tapped in original order.
  // Loading cards treated as un-tapped (they'll slot in once resolved).
  const orderedHeadlines = useMemo(() => {
    if (!sortByRelevance) return [...HEADLINES];
    const done: string[] = [];
    const rest: string[] = [];
    for (const h of HEADLINES) {
      const s = states[h];
      if (s?.result) done.push(h);
      else rest.push(h);
    }
    done.sort(
      (a, b) =>
        (states[b]!.result!.relevanceScore) - (states[a]!.result!.relevanceScore)
    );
    return [...done, ...rest];
  }, [sortByRelevance, states]);

  const showSortToggle = personalizedCount >= 3;

  return (
    <section className="mx-auto mt-8 flex max-w-2xl flex-col gap-4">
      {showSortToggle && (
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-2">
          <div className="text-sm text-neutral-600">
            <span className="font-semibold text-neutral-900">{personalizedCount}</span>{" "}
            personalized
          </div>
          <button
            type="button"
            onClick={() => setSortByRelevance((v) => !v)}
            className={
              "rounded-full border px-3 py-1 text-xs font-semibold transition " +
              (sortByRelevance
                ? "border-indigo-500 bg-indigo-600 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-indigo-400 hover:text-indigo-700")
            }
          >
            {sortByRelevance ? "Sorted by relevance ✓" : "Sort by relevance"}
          </button>
        </div>
      )}

      {orderedHeadlines.map((h) => {
        const s = states[h] ?? EMPTY;
        return (
          <NewsCard
            key={h}
            headline={h}
            loading={s.loading}
            result={s.result}
            error={s.error}
            onSoWhat={() => personalize(h)}
          />
        );
      })}
    </section>
  );
}

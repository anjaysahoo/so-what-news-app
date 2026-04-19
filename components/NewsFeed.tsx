"use client";

import { useMemo, useRef, useState } from "react";
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
  const [batchRunning, setBatchRunning] = useState(false);
  // sync guard — setState updaters aren't guaranteed to run synchronously,
  // so we can't rely on closure flags. ref is safe across concurrent calls.
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

  const personalizedCount = useMemo(
    () => Object.values(states).filter((s) => s.result).length,
    [states]
  );

  const untappedCount = useMemo(
    () =>
      HEADLINES.filter((h) => {
        const s = states[h];
        return !s || (!s.loading && !s.result);
      }).length,
    [states]
  );

  async function personalizeAll() {
    if (batchRunning) return;
    const targets = HEADLINES.filter((h) => {
      const s = states[h];
      return !s || (!s.loading && !s.result);
    });
    if (targets.length === 0) return;
    setBatchRunning(true);
    // fire in parallel — results animate in one by one as each resolves
    await Promise.all(targets.map((h) => personalize(h)));
    setBatchRunning(false);
  }

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
  const showPersonalizeAll = untappedCount > 0;
  const showToolbar = showSortToggle || showPersonalizeAll;

  return (
    <section className="mx-auto mt-8 flex max-w-2xl flex-col gap-4">
      {showToolbar && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-2">
          <div className="text-sm text-neutral-600">
            <span className="font-semibold text-neutral-900">{personalizedCount}</span>{" "}
            personalized
            {untappedCount > 0 && (
              <span className="text-neutral-400"> · {untappedCount} left</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showPersonalizeAll && (
              <button
                type="button"
                onClick={personalizeAll}
                disabled={batchRunning}
                className={
                  "rounded-full border px-3 py-1 text-xs font-semibold transition " +
                  (batchRunning
                    ? "cursor-not-allowed border-indigo-200 bg-indigo-50 text-indigo-400"
                    : "border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700")
                }
              >
                {batchRunning ? `Personalizing ${untappedCount}…` : `Personalize all (${untappedCount})`}
              </button>
            )}
            {showSortToggle && (
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
            )}
          </div>
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

"use client";

import { useEffect, useRef, useState } from "react";
import { HEADLINES } from "@/constants/headlines";
import type { Persona, PersonalizeResponse } from "@/lib/schema";
import { NewsCard, type CardStatus, type Personalized } from "./NewsCard";

type CardState = {
  status: CardStatus;
  result: Personalized | null;
  error: string | null;
};

const INITIAL: CardState = { status: "idle", result: null, error: null };

// Cached shape: per-headline-id result map for a given persona signature.
type CachedMap = Record<string, CardState>;

function personaKey(p: Persona) {
  return JSON.stringify(p);
}

async function personalizeOne(headline: string, persona: Persona): Promise<Personalized> {
  const res = await fetch("/api/personalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ headline, persona }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: PersonalizeResponse = await res.json();
  return {
    impactHeadline: data.impactHeadline,
    whyItMatters: data.whyItMatters,
    relevanceScore: data.relevanceScore,
  };
}

export function NewsFeed({ persona }: { persona: Persona }) {
  // Cache survives persona toggles. Keyed by JSON.stringify(persona).
  const cacheRef = useRef<Map<string, CachedMap>>(new Map());
  // Tracks the persona currently being fetched so stale responses are dropped.
  const activeKeyRef = useRef<string>("");

  const [states, setStates] = useState<Record<string, CardState>>(() => {
    const initial: Record<string, CardState> = {};
    for (const h of HEADLINES) initial[h.id] = INITIAL;
    return initial;
  });

  useEffect(() => {
    const key = personaKey(persona);
    activeKeyRef.current = key;

    // cache hit: paint instantly, no fetch
    const cached = cacheRef.current.get(key);
    if (cached) {
      setStates(cached);
      return;
    }

    // cold: all cards -> loading, fire 12 in parallel
    const loadingMap: Record<string, CardState> = {};
    for (const h of HEADLINES) loadingMap[h.id] = { status: "loading", result: null, error: null };
    setStates(loadingMap);

    // Per-card settle handler → update that card as its promise lands
    const jobs = HEADLINES.map(async (item) => {
      try {
        const result = await personalizeOne(item.headline, persona);
        if (activeKeyRef.current !== key) return;
        setStates((prev) => ({
          ...prev,
          [item.id]: { status: "ready", result, error: null },
        }));
      } catch (err) {
        console.log("personalize error", item.id, err);
        if (activeKeyRef.current !== key) return;
        setStates((prev) => ({
          ...prev,
          [item.id]: { status: "error", result: null, error: "Failed. Tap to retry." },
        }));
      }
    });

    // Once everything settles, snapshot into cache so toggling back is instant
    Promise.allSettled(jobs).then(() => {
      if (activeKeyRef.current !== key) return;
      setStates((prev) => {
        cacheRef.current.set(key, prev);
        return prev;
      });
    });
  }, [persona]);

  function retry(id: string, headline: string) {
    setStates((prev) => ({
      ...prev,
      [id]: { status: "loading", result: null, error: null },
    }));
    const key = activeKeyRef.current;
    personalizeOne(headline, persona)
      .then((result) => {
        if (activeKeyRef.current !== key) return;
        setStates((prev) => {
          const next = { ...prev, [id]: { status: "ready" as const, result, error: null } };
          // sync cache if already stored
          const cached = cacheRef.current.get(key);
          if (cached) cacheRef.current.set(key, { ...cached, [id]: next[id] });
          return next;
        });
      })
      .catch((err) => {
        console.log("retry error", id, err);
        if (activeKeyRef.current !== key) return;
        setStates((prev) => ({
          ...prev,
          [id]: { status: "error", result: null, error: "Failed. Tap to retry." },
        }));
      });
  }

  return (
    <section className="mx-auto mt-8 flex w-full max-w-[400px] flex-col gap-8">
      {HEADLINES.map((item, i) => {
        const s = states[item.id] ?? INITIAL;
        return (
          <NewsCard
            key={item.id}
            headline={item.headline}
            image={item.image}
            imageIndex={i}
            status={s.status}
            result={s.result}
            error={s.error}
            onRetry={() => retry(item.id, item.headline)}
          />
        );
      })}
    </section>
  );
}

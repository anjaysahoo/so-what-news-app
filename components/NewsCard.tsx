"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Persona, PersonalizeResponse } from "@/lib/schema";

type Personalized = Pick<
  PersonalizeResponse,
  "impactHeadline" | "whyItMatters" | "relevanceScore"
>;

type Props = {
  headline: string;
  persona: Persona;
};

export function NewsCard({ headline, persona }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Personalized | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSoWhat() {
    if (loading || result) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, persona }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PersonalizeResponse = await res.json();
      setResult({
        impactHeadline: data.impactHeadline,
        whyItMatters: data.whyItMatters,
        relevanceScore: data.relevanceScore,
      });
    } catch (err) {
      console.log("personalize error", err);
      setError("Failed to personalize. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const showExpanded = loading || !!result;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
          Headline
        </div>
        <CardTitle className="text-lg leading-snug text-neutral-900">
          {headline}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {!result && !loading && (
          <Button onClick={handleSoWhat} disabled={loading} variant="default">
            So What?
          </Button>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* grid-rows 0fr -> 1fr trick to animate height without a lib */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: showExpanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            {loading && (
              <div className="space-y-3 rounded-lg border border-indigo-200 bg-indigo-50/40 p-4">
                <Skeleton className="h-5 w-24 bg-indigo-200/70" />
                <Skeleton className="h-5 w-5/6 bg-indigo-200/70" />
                <Skeleton className="h-3 w-full bg-indigo-200/50" />
                <Skeleton className="h-3 w-11/12 bg-indigo-200/50" />
              </div>
            )}

            {result && !loading && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Why this matters to you
                  </span>
                  <span className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-xs font-semibold text-neutral-700">
                    Relevance: {result.relevanceScore}/10
                  </span>
                </div>
                <div className="text-base font-semibold leading-snug text-neutral-900">
                  {result.impactHeadline}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  {result.whyItMatters}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

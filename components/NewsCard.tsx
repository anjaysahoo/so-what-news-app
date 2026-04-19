"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PersonalizeResponse } from "@/lib/schema";

export type Personalized = Pick<
  PersonalizeResponse,
  "impactHeadline" | "whyItMatters" | "relevanceScore"
>;

type Props = {
  headline: string;
  loading: boolean;
  result: Personalized | null;
  error: string | null;
  onSoWhat: () => void;
};

// green 8-10, amber 5-7, red 1-4
function badgeClasses(score: number) {
  if (score >= 8) return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (score >= 5) return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-red-100 text-red-800 border-red-300";
}

export function NewsCard({ headline, loading, result, error, onSoWhat }: Props) {
  const showExpanded = loading || !!result;
  // low-relevance dim: score <= 3
  const dim = result && result.relevanceScore <= 3;

  return (
    <Card
      className={
        "transition-all duration-300 ease-out hover:shadow-md " +
        (dim ? "scale-[0.98] opacity-50" : "opacity-100")
      }
    >
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
          <Button onClick={onSoWhat} disabled={loading} variant="default">
            So What?
          </Button>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* grid-rows 0fr -> 1fr trick animates height without a lib */}
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
              <div className="impact-reveal rounded-lg border border-indigo-200 bg-indigo-50/40 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Why this matters to you
                  </span>
                  <span
                    className={
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold " +
                      badgeClasses(result.relevanceScore)
                    }
                  >
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

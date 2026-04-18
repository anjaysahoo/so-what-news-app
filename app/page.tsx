"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAREER_OPTIONS,
  FINANCIAL_OPTIONS,
  LIFE_STAGE_OPTIONS,
} from "@/constants/persona-options";
import type { GenerateResponse, ImpactCard } from "@/lib/schema";

export default function Home() {
  const [career, setCareer] = useState<string>(CAREER_OPTIONS[0]);
  const [financialProfile, setFinancialProfile] = useState<string>(FINANCIAL_OPTIONS[0]);
  const [lifeStage, setLifeStage] = useState<string>(LIFE_STAGE_OPTIONS[0]);
  const [results, setResults] = useState<ImpactCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [tookMs, setTookMs] = useState<number | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/generate-impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: { career, financialProfile, lifeStage },
        }),
      });
      const data: GenerateResponse = await res.json();
      setResults(data.results);
      setTookMs(data.tookMs);
    } catch (err) {
      console.log("generate error", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          SoWhat News
        </h1>
        <p className="mt-2 text-lg text-neutral-600">
          See how today&apos;s news actually affects{" "}
          <span className="italic font-medium text-neutral-900">you</span>.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Career
          </label>
          <Select value={career} onValueChange={setCareer}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAREER_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Financial Profile
          </label>
          <Select value={financialProfile} onValueChange={setFinancialProfile}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FINANCIAL_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Life Stage
          </label>
          <Select value={lifeStage} onValueChange={setLifeStage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIFE_STAGE_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="mt-6 flex items-center gap-4">
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </Button>
        {tookMs !== null && !loading && (
          <span className="text-sm text-neutral-500">Done in {tookMs}ms</span>
        )}
      </div>

      {loading && (
        <section className="mt-10 space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-5/6" />
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
              </Card>
              <Card className="border-indigo-200 bg-indigo-50/40">
                <CardHeader className="space-y-3">
                  <Skeleton className="h-5 w-28 bg-indigo-200/70" />
                  <Skeleton className="h-6 w-full bg-indigo-200/70" />
                  <Skeleton className="h-6 w-4/5 bg-indigo-200/70" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-3 w-full bg-indigo-200/50" />
                  <Skeleton className="h-3 w-11/12 bg-indigo-200/50" />
                </CardContent>
              </Card>
            </div>
          ))}
        </section>
      )}

      {results && !loading && (
        <section className="mt-10 space-y-5">
          {results.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <Card className="bg-neutral-50/50">
                <CardHeader>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                    Generic headline
                  </div>
                  <CardTitle className="text-neutral-400 line-through decoration-neutral-300 decoration-1 font-normal">
                    {r.headline}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-indigo-200 bg-indigo-50/40 shadow-md">
                <CardHeader>
                  <Badge className="w-fit">Why this matters to you</Badge>
                  <CardTitle className="mt-2 text-lg leading-snug text-neutral-900">
                    {r.impactHeadline}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-neutral-700">
                    {r.whyItMatters}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

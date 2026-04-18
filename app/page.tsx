"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <header className="mb-8">
        <h1 className="text-3xl font-bold">SoWhat News</h1>
        <p className="text-neutral-600">
          See how today&apos;s news actually affects <span className="italic">you</span>.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Career</label>
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
          <label className="mb-1 block text-sm font-medium">Financial Profile</label>
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
          <label className="mb-1 block text-sm font-medium">Life Stage</label>
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

      {results && (
        <section className="mt-8 space-y-4">
          {results.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <Card>
                <CardHeader>
                  <div className="text-xs uppercase tracking-wide text-neutral-500">
                    Generic headline
                  </div>
                  <CardTitle>{r.headline}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="text-xs uppercase tracking-wide text-neutral-500">
                    Impact on you
                  </div>
                  <CardTitle>{r.impactHeadline}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-700">{r.whyItMatters}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

"use client";

import { useState } from "react";
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
  PERSONA_PRESETS,
  type PersonaPreset,
} from "@/constants/persona-options";
import { NewsFeed } from "@/components/NewsFeed";

export default function Home() {
  const [career, setCareer] = useState<string>(CAREER_OPTIONS[0]);
  const [financialProfile, setFinancialProfile] = useState<string>(FINANCIAL_OPTIONS[0]);
  const [lifeStage, setLifeStage] = useState<string>(LIFE_STAGE_OPTIONS[0]);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  function applyPreset(preset: PersonaPreset) {
    setCareer(preset.career);
    setFinancialProfile(preset.financialProfile);
    setLifeStage(preset.lifeStage);
    setActivePreset(preset.label);
  }

  const persona = { career, financialProfile, lifeStage };

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          SoWhat News
        </h1>
        <p className="mt-2 text-lg text-neutral-600">
          Tap <span className="font-semibold">So What?</span> on any headline —
          see how it hits{" "}
          <span className="italic font-medium text-neutral-900">you</span>.
        </p>
      </header>

      <div className="mb-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Try a preset persona
        </div>
        <div className="flex flex-wrap gap-2">
          {PERSONA_PRESETS.map((p) => {
            const active = activePreset === p.label;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className={
                  "rounded-full border px-3 py-1.5 text-sm transition " +
                  (active
                    ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
                    : "border-neutral-300 bg-white text-neutral-700 hover:border-indigo-400 hover:text-indigo-700")
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Career
          </label>
          <Select
            value={career}
            onValueChange={(v) => {
              setCareer(v);
              setActivePreset(null);
            }}
          >
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
          <Select
            value={financialProfile}
            onValueChange={(v) => {
              setFinancialProfile(v);
              setActivePreset(null);
            }}
          >
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
          <Select
            value={lifeStage}
            onValueChange={(v) => {
              setLifeStage(v);
              setActivePreset(null);
            }}
          >
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

      <NewsFeed persona={persona} />
    </main>
  );
}

"use client";

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
import { useLocalStorage } from "@/lib/useLocalStorage";

type StoredPersona = {
  career: string;
  financialProfile: string;
  lifeStage: string;
};

const DEFAULT_PERSONA: StoredPersona = {
  career: CAREER_OPTIONS[0],
  financialProfile: FINANCIAL_OPTIONS[0],
  lifeStage: LIFE_STAGE_OPTIONS[0],
};

export default function Home() {
  const [persona, setPersona] = useLocalStorage<StoredPersona>(
    "sowhat:persona",
    DEFAULT_PERSONA
  );
  const [activePreset, setActivePreset] = useLocalStorage<string | null>(
    "sowhat:activePreset",
    null
  );

  function applyPreset(preset: PersonaPreset) {
    setPersona({
      career: preset.career,
      financialProfile: preset.financialProfile,
      lifeStage: preset.lifeStage,
    });
    setActivePreset(preset.label);
  }

  function updateField(field: keyof StoredPersona, value: string) {
    setPersona({ ...persona, [field]: value });
    setActivePreset(null);
  }

  // Remount the feed when persona changes — drops all personalized card state.
  const personaKey = `${persona.career}|${persona.financialProfile}|${persona.lifeStage}`;

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-8">
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
            value={persona.career}
            onValueChange={(v) => updateField("career", v)}
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
            value={persona.financialProfile}
            onValueChange={(v) => updateField("financialProfile", v)}
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
            value={persona.lifeStage}
            onValueChange={(v) => updateField("lifeStage", v)}
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

      <NewsFeed key={personaKey} persona={persona} />
    </main>
  );
}

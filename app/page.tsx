"use client";

import Image from "next/image";
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

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* Brand header */}
      <header className="sticky top-0 z-10 border-b border-black/5 bg-[var(--page-bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Image
            src="/brand.png"
            alt="SoWhat? — The news. But for you."
            width={1024}
            height={555}
            priority
            className="h-10 w-auto md:h-12"
          />
          <div className="hidden text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] sm:block">
            news that hits you
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-16 pt-6">
        {/* Persona controls — compact */}
        <section className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Your lens
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {PERSONA_PRESETS.map((p) => {
              const active = activePreset === p.label;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition " +
                    (active
                      ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white"
                      : "border-neutral-300 bg-white text-neutral-700 hover:border-[var(--brand-black)]")
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Career
              </label>
              <Select value={persona.career} onValueChange={(v) => updateField("career", v)}>
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
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Financial
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
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Life stage
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
          </div>
        </section>

        <NewsFeed persona={persona} />
      </main>
    </div>
  );
}

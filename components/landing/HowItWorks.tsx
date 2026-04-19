import type { ReactNode } from "react";
import { FadeUp } from "./FadeUp";

type Step = {
  n: string;
  title: string;
  body: string;
  visual: ReactNode;
};

const STEPS: Step[] = [
  {
    n: "1",
    title: "Pick your persona",
    body: "Tech investor? Teacher? Parent? All three? Set the lens you read the news through.",
    visual: (
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-[var(--page-bg)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] ring-1 ring-black/10">
          Tech investor
        </span>
        <span className="rounded-full bg-[var(--brand-yellow)] px-2.5 py-1 text-xs font-bold text-[var(--brand-black)]">
          Teacher
        </span>
        <span className="rounded-full bg-[var(--page-bg)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] ring-1 ring-black/10">
          Parent
        </span>
      </div>
    ),
  },
  {
    n: "2",
    title: "Tap \u201cSo What?\u201d",
    body: "On any headline. One tap asks the app to explain why this story matters to you.",
    visual: (
      <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-yellow)] px-4 py-2 text-sm font-bold text-[var(--brand-black)] shadow-sm">
        <span>So What?</span>
        <span aria-hidden="true">→</span>
      </div>
    ),
  },
  {
    n: "3",
    title: "See what matters",
    body: "A personal take and a relevance score from 1\u201310. Skip the noise. Read what hits.",
    visual: (
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-black)] font-display text-sm font-bold text-[var(--brand-yellow)]">
          9
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          / 10 relevance
        </span>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <FadeUp>
        <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
          How it works
        </h2>
      </FadeUp>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <FadeUp
            key={s.n}
            delayMs={120 + i * 120}
            className="flex flex-col rounded-2xl border border-black/10 bg-white p-8"
          >
            <div className="font-display text-5xl font-bold text-[var(--brand-yellow)]">
              {s.n}
            </div>
            <h3 className="font-display mt-4 text-xl font-bold text-[var(--text-primary)]">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {s.body}
            </p>
            <div className="mt-6">{s.visual}</div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

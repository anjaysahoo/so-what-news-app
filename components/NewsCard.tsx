"use client";

import Image from "next/image";
import type { PersonalizeResponse } from "@/lib/schema";

export type Personalized = Pick<
  PersonalizeResponse,
  "impactHeadline" | "whyItMatters" | "relevanceScore"
>;

type Props = {
  headline: string;
  image: string;
  imageIndex: number;
  loading: boolean;
  result: Personalized | null;
  error: string | null;
  onSoWhat: () => void;
};

function badgeClasses(score: number) {
  if (score >= 8) return "bg-emerald-100 text-emerald-800 border-emerald-300";
  if (score >= 5) return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-red-100 text-red-800 border-red-300";
}

export function NewsCard({
  headline,
  image,
  imageIndex,
  loading,
  result,
  error,
  onSoWhat,
}: Props) {
  return (
    <article className="flex flex-col gap-3">
      {/* Portrait card */}
      <div
        className="relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-2xl bg-[var(--card-bg)] shadow-[0_4px_24px_rgba(17,17,17,0.08)] ring-1 ring-black/5"
        style={{ maxHeight: "75vh" }}
      >
        {/* Image — top 55% */}
        <div className="relative h-[55%] w-full overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover"
            priority={imageIndex < 2}
          />
        </div>

        {/* Content — bottom 45% */}
        <div className="flex h-[45%] flex-col justify-between p-5">
          <h2 className="font-display text-[22px] font-bold leading-tight tracking-tight text-[var(--text-primary)]">
            {headline}
          </h2>

          <button
            type="button"
            onClick={onSoWhat}
            disabled={loading}
            className="mt-3 inline-flex w-fit items-center justify-center rounded-full bg-[var(--brand-yellow)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-black)] shadow-sm transition hover:bg-[var(--brand-yellow-dark)] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Thinking…" : "So What?"}
          </button>
        </div>
      </div>

      {/* Vestigial result panel — lives on card back in iter 2 */}
      {(loading || result || error) && (
        <div className="rounded-xl border border-neutral-200 bg-white/60 p-4 text-sm">
          {loading && <p className="text-neutral-500">Personalizing…</p>}
          {error && <p className="text-red-600">{error}</p>}
          {result && (
            <div className="impact-reveal">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold " +
                    badgeClasses(result.relevanceScore)
                  }
                >
                  {result.relevanceScore}/10
                </span>
              </div>
              <div className="font-display text-base font-semibold leading-snug text-neutral-900">
                {result.impactHeadline}
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-700">
                {result.whyItMatters}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

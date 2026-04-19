"use client";

import Image from "next/image";
import { useState } from "react";
import type { PersonalizeResponse } from "@/lib/schema";

export type Personalized = Pick<
  PersonalizeResponse,
  "impactHeadline" | "whyItMatters" | "relevanceScore"
>;

// idle = not started, loading = in-flight, ready = result in hand, error = failed
export type CardStatus = "idle" | "loading" | "ready" | "error";

type Props = {
  headline: string;
  image: string;
  imageIndex: number;
  status: CardStatus;
  result: Personalized | null;
  error: string | null;
  onRetry?: () => void;
};

export function NewsCard({
  headline,
  image,
  imageIndex,
  status,
  result,
  error,
  onRetry,
}: Props) {
  const [flipped, setFlipped] = useState(false);

  const canFlip = status === "ready" && !!result;

  function handleFrontTap() {
    if (canFlip) setFlipped(true);
    else if (status === "error" && onRetry) onRetry();
  }

  function handleBackTap() {
    setFlipped(false);
  }

  return (
    <div
      className={`flip-card w-full${flipped ? " is-flipped" : ""}`}
      style={{ aspectRatio: "3 / 4", maxHeight: "75vh" }}
    >
      <div className="flipper">
        {/* FRONT */}
        <article
          className="face face-front flex flex-col bg-[var(--card-bg)] shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
        >
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

          <div className="flex h-[45%] flex-col justify-between p-5">
            <h2 className="font-display text-[22px] font-bold leading-tight tracking-tight text-[var(--text-primary)]">
              {headline}
            </h2>

            <SoWhatButton
              status={status}
              error={error}
              onClick={handleFrontTap}
            />
          </div>
        </article>

        {/* BACK */}
        <article
          onClick={handleBackTap}
          className="face face-back flex cursor-pointer flex-col gap-3 bg-[var(--card-back-bg)] p-6 text-[var(--text-on-dark)]"
        >
          {result && (
            <>
              <div className="self-end font-display text-[48px] font-extrabold leading-none tracking-tight text-[var(--brand-yellow)]">
                {result.relevanceScore}/10
              </div>

              <h3 className="font-display text-[22px] font-bold leading-[1.2]">
                {result.impactHeadline}
              </h3>

              <p
                className="text-[15px] leading-relaxed text-[rgba(250,247,240,0.82)]"
                style={{ overflowY: "auto" }}
              >
                {result.whyItMatters}
              </p>

              <div className="mt-auto text-[11px] uppercase tracking-[0.18em] text-[rgba(250,247,240,0.55)]">
                ← tap to flip back
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  );
}

function SoWhatButton({
  status,
  error,
  onClick,
}: {
  status: CardStatus;
  error: string | null;
  onClick: () => void;
}) {
  const isLoading = status === "loading" || status === "idle";
  const isReady = status === "ready";
  const isError = status === "error";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={
        "mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--brand-yellow)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-black)] shadow-sm transition hover:shadow-md active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 " +
        (isReady ? "btn-ready hover:bg-[var(--brand-yellow-dark)]" : "")
      }
      aria-label={isError ? `Retry: ${error}` : "So What?"}
    >
      {isLoading && <span className="btn-spinner" aria-hidden />}
      <span>
        {isError ? "Try again" : isLoading ? "Thinking…" : "So What?"}
      </span>
    </button>
  );
}

"use client";

export function HeroCardMock() {
  return (
    <div
      className="relative mx-auto w-full max-w-[320px]"
      style={{ perspective: "1200px" }}
      aria-hidden="true"
    >
      <div
        className="hero-card-tilt rounded-[20px] bg-[var(--card-bg)] shadow-[0_30px_60px_-20px_rgba(17,17,17,0.25),0_10px_30px_-15px_rgba(17,17,17,0.2)] ring-1 ring-black/5"
        style={{ transform: "rotate(-3deg)" }}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-[20px] bg-[#d7c9a0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=70"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
          <div className="relative flex h-full w-full items-end p-5">
            <div className="flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-yellow)]" />
              Breaking
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-display text-[20px] font-bold leading-tight text-[var(--text-primary)]">
            Fed signals surprise rate cut ahead of jobs report
          </h3>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Reuters · 4m ago</p>

          <button
            type="button"
            tabIndex={-1}
            className="hero-btn-pulse mt-5 inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-yellow)] px-5 py-3 text-sm font-bold text-[var(--brand-black)]"
          >
            So What?
          </button>
        </div>
      </div>
    </div>
  );
}

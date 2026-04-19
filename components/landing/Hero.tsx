import Link from "next/link";
import { HeroCardMock } from "./HeroCardMock";

export function Hero() {
  return (
    <section className="mx-auto grid min-h-[60vh] max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
      <div className="flex flex-col items-start">
        <h1 className="font-display max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)] md:text-6xl">
          Headlines tell you <span className="italic">what</span> happened.
          <br />
          <span className="text-[var(--text-muted)]">
            We tell you <span className="not-italic text-[var(--text-primary)]">so what</span>.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-[var(--text-muted)] md:text-lg">
          Pick who you are. Tap any headline. Get a personal take and a relevance score from 1–10.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand-yellow)] px-8 py-4 text-base font-bold text-[var(--brand-black)] shadow-sm transition hover:bg-[var(--brand-yellow-dark)]"
          >
            Start Using
          </Link>
          <Link
            href="/waitlist"
            className="inline-flex items-center justify-center rounded-full border border-[var(--brand-black)] bg-transparent px-8 py-4 text-base font-medium text-[var(--brand-black)] transition hover:bg-black/5"
          >
            Join Waitlist
          </Link>
        </div>
      </div>

      <div className="hidden md:block">
        <HeroCardMock />
      </div>
    </section>
  );
}

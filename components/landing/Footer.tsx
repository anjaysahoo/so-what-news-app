import Image from "next/image";
import { FadeUp } from "./FadeUp";

export function Footer() {
  return (
    <footer className="border-t border-black/5">
      <FadeUp as="div" className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <Image
            src="/brand.png"
            alt="SoWhat?"
            width={1024}
            height={555}
            className="h-8 w-auto"
          />
          <div className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} SoWhat News.
          </div>
        </div>
        <div className="mt-4 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]/80">
          Built for demo day &middot; Shipped ugly, works anyway.
        </div>
      </FadeUp>
    </footer>
  );
}

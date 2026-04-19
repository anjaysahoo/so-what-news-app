"use client";

import Image from "next/image";
import { useState } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "already_joined" }
  | { kind: "error"; message: string };

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const isSubmitting = status.kind === "submitting";
  const isDone = status.kind === "success" || status.kind === "already_joined";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting || isDone) return;

    setStatus({ kind: "submitting" });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
      };

      if (res.ok && data.ok) {
        setStatus({ kind: "success" });
        return;
      }
      if (res.status === 409 || data.code === "already_joined") {
        setStatus({ kind: "already_joined" });
        return;
      }
      if (res.status === 400 || data.code === "invalid_email") {
        setStatus({ kind: "error", message: "Please enter a valid email." });
        return;
      }
      setStatus({
        kind: "error",
        message: "Something went wrong. Please try again.",
      });
    } catch {
      setStatus({
        kind: "error",
        message: "Network error. Please try again.",
      });
    }
  }

  return (
    <main
      className="min-h-screen px-6 py-6 md:py-8"
      style={{ backgroundColor: "#F3E240" }}
    >
      <header className="flex items-center">
        <Image
          src="/brand.png"
          alt="Brand logo"
          width={120}
          height={40}
          priority
          className="h-10 w-auto md:h-12"
        />
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center justify-center">
        <div className="w-full">
          {status.kind === "success" ? (
            <div className="flex flex-col items-center text-center">
              <Image
                src="/waitlist-success.png"
                alt="You're on the waitlist"
                width={480}
                height={480}
                priority
                className="h-auto w-full max-w-sm rounded-md"
              />
              <h2
                className="mt-6 text-2xl md:text-3xl font-bold tracking-tight"
                style={{ color: "#272728" }}
              >
                You&apos;re on the list!
              </h2>
              <p
                className="mt-2 text-base md:text-lg"
                style={{ color: "#272728" }}
              >
                We&apos;ll let you know as soon as new features drop.
              </p>
            </div>
          ) : (
            <>
              <h1
                className="text-4xl md:text-5xl font-bold tracking-tight"
                style={{ color: "#272728" }}
              >
                Join the waitlist
              </h1>
              <p
                className="mt-3 text-base md:text-lg"
                style={{ color: "#272728" }}
              >
                Be the first to get access to all features.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status.kind === "error") setStatus({ kind: "idle" });
                  }}
                  disabled={isSubmitting || isDone}
                  className="w-full rounded-md border-2 bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60"
                  style={{
                    borderColor: "#272728",
                    color: "#272728",
                  }}
                />

                <button
                  type="submit"
                  disabled={isSubmitting || isDone}
                  className="rounded-md px-4 py-3 text-base font-semibold text-white transition disabled:opacity-60 hover:opacity-90"
                  style={{ backgroundColor: "#272728" }}
                >
                  {isSubmitting ? "Joining…" : "Join Waitlist"}
                </button>
              </form>

              <div
                className="mt-4 min-h-[1.5rem] text-sm"
                style={{ color: "#272728" }}
              >
                {status.kind === "already_joined" && (
                  <p className="font-medium">You&apos;re already on the list.</p>
                )}
                {status.kind === "error" && (
                  <p className="font-medium">{status.message}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
